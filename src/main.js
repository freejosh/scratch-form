import {
  collectNamedNodes,
  getArrayNodeIndex,
  cacheArrayNodes,
  getNodeValue,
  setNodeValue,
} from './dom';
import {
  getObjectValue,
  hasObjectValue,
  setObjectValue,
} from './object';

const PREFIX = '_sf_';

function ScratchForm(formElement, options = {}) {
  const {
    onChange,
    event = 'input',
  } = options;

  const data = {};
  const handler = {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#object_internal_methods

    set(obj, rawName, rawValue) {
      let name = rawName;
      let value = rawValue;
      let node;

      if (rawName.startsWith(PREFIX)) {
        // change came from form - parse data format
        name = rawName.slice(PREFIX.length);
        ({ value, node } = rawValue);
      } else {
        // change came from object - set value on form
        node = formElement.querySelector(`[name="${name}"]`);
        if (node) {
          setNodeValue(node, rawValue);
        }
      }

      setObjectValue(obj, name, value);
      onChange(name, value, obj, node);

      return true;
    },

    deleteProperty(obj, name) {
      setObjectValue(obj, name, undefined, true);
      onChange(name, undefined, obj);
      return true;
    },

    get: getObjectValue,

    has: hasObjectValue,
  };

  const proxy = new Proxy(data, handler);

  const onNodeChange = (node) => {
    let { name } = node;
    if (!name) {
      return;
    }

    const value = getNodeValue(node);

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
  formElement.addEventListener(event, (e) => {
    onNodeChange(e.target);
  });

  formElement.addEventListener('reset', () => {
    // wait for form element values to actually change
    setTimeout(resetData, 0);
  });

  // watch for DOM mutations to add/remove data when nodes are added/removed
  const observer = new MutationObserver((mutations) => {
    // nodes added/removed may not be named fields or may be parent of field nodes - collect
    // relevant nodes across all mutations in event
    const removedFields = [];
    const addedFields = [];
    mutations.forEach(({ addedNodes, removedNodes }) => {
      removedNodes.forEach((node) => collectNamedNodes(node, removedFields));
      addedNodes.forEach((node) => collectNamedNodes(node, addedFields));
    });

    removedFields.forEach((node) => {
      let { name } = node;

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
  observer.observe(formElement, { childList: true, subtree: true });

  return proxy;
}

window.ScratchForm = ScratchForm;
export default ScratchForm;
