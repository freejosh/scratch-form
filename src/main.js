const PREFIX = '_sf_';

function parseNamePath(str) {
  let name = str;
  let path = [];
  const i = str.indexOf('[');
  if (i !== -1) {
    name = str.slice(0, i);
    path = str.slice(i + 1, -1).split('][');
  }
  path.unshift(name);
  return path;
}

function buildNamePath(arr) {
  const [name, ...path] = arr;
  if (!path.length) {
    return name;
  }
  return `${name}[${path.join('][')}]`;
}

function setObjectValue(obj, nameArg, value, del = false) {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      if (/^[0-9]+$/.test(path[0])) {
        // path part is numeric - treat as array
        obj[name] = [];
      } else {
        // path part is string
        obj[name] = {};
      }
    }

    setObjectValue(obj[name], buildNamePath(path), value, del);
    return;
  }

  if (del) {
    if (Array.isArray(obj)) {
      obj.splice(name, 1);
      return;
    }

    delete obj[name];
    return;
  }

  obj[name] = value;
}

function getNodeValue(node) {
  const { type, value } = node;

  if (type === 'checkbox' || type === 'radio') {
    return node.checked ? value : undefined;
  }

  // parse numeric input types
  if (type === 'number' || type === 'range') {
    return parseFloat(value);
  }

  if (type === 'file') {
    return node.files.length ? node.files : null;
  }

  return value;
}

function setNodeValue(node, value) {
  if (node.type === 'checkbox' || node.type === 'radio') {
    node.checked = Boolean(value);
    return;
  }

  node.value = value;
}

function collectNamedNodes(node, list) {
  if (node.hasAttribute('name')) {
    list.push(node);
  }
  list.splice(list.length, 0, ...node.querySelectorAll('[name]'));
}

function ScratchForm(formElement, options = {}) {
  const {
    onChange,
    event = 'input',
  } = options;

  const data = {};
  const handler = {
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
  };

  const proxy = new Proxy(data, handler);

  // maintain a cache of implicit array field names to matching nodes in DOM order, so that we don't
  // have to reselect them during changes, and can find the old index during removal mutations
  this.arrayCache = {};
  const cacheArrayNodes = (name) => {
    if (name) {
      this.arrayCache[name] = [];
    } else {
      this.arrayCache = {};
    }

    const query = name ? `[name="${name}"]` : '[name$="[]"]';
    Array.from(formElement.querySelectorAll(query)).forEach((node) => {
      let cache = this.arrayCache[node.name];
      if (!cache) {
        cache = [];
        this.arrayCache[node.name] = cache;
      }
      cache.push(node);
    });
  };

  const getArrayNodeIndex = (node) => {
    const index = this.arrayCache[node.name].findIndex((el) => el === node);
    if (index === -1) {
      console.error(`Could not find index for node: ${node.outerHTML}`);
    }
    return index;
  };

  const onNodeChange = (node) => {
    let { name } = node;
    if (!name) {
      return;
    }

    const value = getNodeValue(node);

    // `[]` is implied array index - get stable index from cache
    if (name.endsWith('[]')) {
      const index = getArrayNodeIndex(node);
      if (index === -1) {
        return;
      }
      name = `${name.slice(0, -2)}[${index}]`;
    }

    proxy[`${PREFIX}${name}`] = { value, node };
  };

  function resetData() {
    Array.from(formElement.querySelectorAll('[name]')).forEach(onNodeChange);
  }

  // initialize array node cache
  cacheArrayNodes();

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
        const index = getArrayNodeIndex(node);
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
    cacheArrayNodes();

    addedFields.forEach((node) => {
      onNodeChange(node);
    });
  });
  observer.observe(formElement, { childList: true, subtree: true });

  return proxy;
}

window.ScratchForm = ScratchForm;
export default ScratchForm;
