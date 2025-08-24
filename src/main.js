const PREFIX = '_sf_';

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
          node.value = rawValue;
        }
      }

      obj[name] = value;
      onChange(name, value, obj, node);

      return true;
    },
  };

  const proxy = new Proxy(data, handler);

  // initialize with current form values
  Array.from(formElement.querySelectorAll('[name]')).forEach((el) => {
    proxy[el.name] = el.value;
  });

  // bind handler to form
  formElement.addEventListener('change', (e) => {
    const { name, value } = e.target;
    if (!name) {
      return;
    }
    proxy[`${PREFIX}${name}`] = { value, node: e.target };
  });

  return proxy;
}

window.ScratchForm = ScratchForm;
export default ScratchForm;
