import {
  collectNamedNodes,
  getArrayNodeIndex,
  cacheArrayNodes,
  getNodeValue,
  setNodeValue,
  InputFieldElement,
  ArrayNodeCache,
} from './dom';
import {
  getObjectValue,
  hasObjectValue,
  setObjectValue,
} from './object';

const PREFIX = '_sf_';

export interface ScratchFormData {
  [key: string]: unknown;
}

export interface ScratchFormOptions {
  onChange?: (
    name: string,
    value: unknown,
    node: InputFieldElement | undefined,
    obj: ScratchFormData,
  ) => void;
  event?: string;
}

function ScratchForm(
  this: { arrayCache: ArrayNodeCache },
  formElement: HTMLFormElement,
  options: ScratchFormOptions = {},
): object {
  const {
    onChange,
    event = 'input',
  } = options;

  const data: ScratchFormData = {};
  const handler: ProxyHandler<ScratchFormData> = {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#object_internal_methods

    set(obj, rawName, rawValue) {
      let name = rawName.toString();
      let value = rawValue;
      let node: InputFieldElement | undefined;

      if (name.startsWith(PREFIX)) {
        // change came from form - parse data format
        name = name.slice(PREFIX.length);
        ({ value, node } = rawValue as { value: unknown, node: InputFieldElement });
      } else {
        // change came from object - set value on form
        node = formElement.querySelector(`[name="${name}"]`) as InputFieldElement || undefined;
        if (node) {
          setNodeValue(node, rawValue);
        }
      }

      setObjectValue(obj, name, value);
      onChange?.(name, value, node, obj);

      return true;
    },

    deleteProperty(obj, nameArg) {
      const name = nameArg.toString();
      setObjectValue(obj, name, undefined, true);
      onChange?.(name, undefined, undefined, obj);
      return true;
    },

    get: getObjectValue,

    has: hasObjectValue,
  };

  const proxy = new Proxy(data, handler);

  const onNodeChange = (node: Element) => {
    let name = node.getAttribute('name');
    if (!name) {
      return;
    }

    const value = getNodeValue(node as InputFieldElement);

    // `[]` is implied array index - get stable index from cache
    if (name.endsWith('[]')) {
      const index = getArrayNodeIndex(node, this.arrayCache);
      if (index === -1) {
        return;
      }
      name = `${name.slice(0, -2)}[${index}]`;
    }

    proxy[`${PREFIX}${name}`] = { value, node };
  };

  function resetData() {
    formElement.querySelectorAll('[name]').forEach(onNodeChange);
  }

  // maintain a cache of implicit array field names to matching nodes in DOM order, so that we don't
  // have to reselect them during changes, and can find the old index during removal mutations
  this.arrayCache = cacheArrayNodes(formElement);

  // initialize with current form values
  resetData();

  // bind handler to form
  formElement.addEventListener(event, (e: Event) => {
    onNodeChange(e.target as Element);
  });

  formElement.addEventListener('reset', () => {
    // wait for form element values to actually change
    setTimeout(resetData, 0);
  });

  // watch for DOM mutations to add/remove data when nodes are added/removed
  const observer = new MutationObserver((mutations) => {
    // nodes added/removed may not be named fields or may be parent of field nodes - collect
    // relevant nodes across all mutations in event
    const removedFields: Element[] = [];
    const addedFields: Element[] = [];
    mutations.forEach(({
      addedNodes,
      removedNodes,
      type,
      target,
    }) => {
      if (type === 'attributes') {
        onNodeChange(target as Element);
      }
      removedNodes.forEach((node) => collectNamedNodes(node as Element, removedFields));
      addedNodes.forEach((node) => collectNamedNodes(node as Element, addedFields));
    });

    removedFields.forEach((node) => {
      let name = node.getAttribute('name');
      if (!name) {
        return;
      }

      // `[]` is implied array index - get stable index from cache
      if (name.endsWith('[]')) {
        const index = getArrayNodeIndex(node, this.arrayCache);
        if (index === -1) {
          return;
        }

        // mutate cache so subsequent loops find correct index after this loop changes the array
        const cache = this.arrayCache[name];
        cache.splice(index, 1);

        if (cache.length === 0) {
          // delete whole array if this was the last node in the cache
          name = name.slice(0, -2);
        } else {
          name = `${name.slice(0, -2)}[${index}]`;
        }
      }

      delete proxy[name];
    });

    // rebuild the cache to sync with current DOM nodes
    this.arrayCache = cacheArrayNodes(formElement);

    addedFields.forEach((node) => {
      onNodeChange(node);
    });
  });
  observer.observe(formElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['value'],
  });

  return proxy;
}

// must use module.exports for bundler to set main function as global
module.exports = ScratchForm;
