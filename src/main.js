const PREFIX = '_sf_';

function setObjectValue(obj, name, value) {
  obj[name] = value;
}

function getNodeValue(node) {
  if (node.type === 'checkbox') {
    return node.checked ? node.value : undefined;
  }

  return node.value;
}

function setNodeValue(node, value) {
  if (node.type === 'checkbox') {
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
    const { name } = node;
    if (!name) {
      return;
    }

    const value = getNodeValue(node);

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
