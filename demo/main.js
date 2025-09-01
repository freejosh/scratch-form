/* global ScratchForm */
let data;

function random(max) {
  return Math.floor(Math.random() * max);
}

let timeout;
function startInterval() {
  timeout = setTimeout(() => {
    data.number = random(data.range);
    startInterval();
  }, data.interval);
}
function stopInterval() {
  clearTimeout(timeout);
}

const textarea = document.getElementById('data');
data = new ScratchForm(document.getElementById('form'), {
  onChange(name, value, node, obj) {
    if (name === 'toggle') {
      if (value) {
        startInterval();
      } else {
        stopInterval();
      }
    }

    textarea.value = JSON.stringify(obj, null, 2);
  },
});

document.getElementById('add-color').addEventListener('click', (e) => {
  const newEl = document.querySelector('[name="colors[]"]').cloneNode();
  newEl.value = `#${random(255).toString(16).padStart(2, '0')}${random(255).toString(16).padStart(2, '0')}${random(255).toString(16).padStart(2, '0')}`;
  e.target.parentNode.insertBefore(newEl, e.target);
});

document.getElementById('remove-color').addEventListener('click', () => {
  const els = document.querySelectorAll('[name="colors[]"]');
  if (els.length > 1) {
    els[els.length - 1].remove();
  }
});
