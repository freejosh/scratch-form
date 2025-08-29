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

export function cacheArrayNodes(formElement) {
  const caches = {};

  formElement.querySelectorAll('[name$="[]"]').forEach((node) => {
    let cache = caches[node.name];
    if (!cache) {
      cache = [];
      caches[node.name] = cache;
    }
    cache.push(node);
  });

  return caches;
}

export function getArrayNodeIndex(node, caches) {
  const index = caches[node.name].findIndex((el) => el === node);
  if (index === -1) {
    console.error(`Could not find index for node: ${node.outerHTML}`);
  }
  return index;
}
