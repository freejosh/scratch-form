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

function setObjectValue(obj, nameArg, value) {
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

    setObjectValue(obj[name], buildNamePath(path), value);
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

function ScratchForm(formElement, options = {}) {
  const {
    onChange,
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
  };

  const proxy = new Proxy(data, handler);

  function onNodeChange(node) {
    let { name } = node;
    if (!name) {
      return;
    }

    const value = getNodeValue(node);

    // `[]` is implied array index - get stable index based on other fields with same name
    if (name.endsWith('[]')) {
      const index = Array.from(formElement.querySelectorAll(`[name="${name}"]`))
        .findIndex((el) => el === node);

      name = `${name.slice(0, -2)}[${index}]`;
    }

    proxy[`${PREFIX}${name}`] = { value, node };
  }

  function resetData() {
    Array.from(formElement.querySelectorAll('[name]')).forEach(onNodeChange);
  }

  // initialize with current form values
  resetData();

  // bind handler to form
  formElement.addEventListener('change', (e) => {
    onNodeChange(e.target);
  });

  formElement.addEventListener('reset', () => {
    // wait for form element values to actually change
    setTimeout(resetData, 0);
  });

  return proxy;
}

window.ScratchForm = ScratchForm;
export default ScratchForm;
