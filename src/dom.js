export function getNodeValue(node) {
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

export function setNodeValue(node, value) {
  if (node.type === 'checkbox' || node.type === 'radio') {
    node.checked = Boolean(value);
    return;
  }

  node.value = value;
}

export function collectNamedNodes(node, list) {
  if (node.hasAttribute('name')) {
    list.push(node);
  }
  list.splice(list.length, 0, ...node.querySelectorAll('[name]'));
}
