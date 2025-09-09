export type InputFieldElement = (
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLButtonElement
);

type NodeValue = string | number | undefined | FileList | null;
export function getNodeValue(node: InputFieldElement): NodeValue {
  const { type, value } = node;

  if (type === 'checkbox' || type === 'radio') {
    return (node as HTMLInputElement).checked ? value : undefined;
  }

  // parse numeric input types
  if (type === 'number' || type === 'range') {
    return parseFloat(value);
  }

  if (type === 'file') {
    const { files } = node as HTMLInputElement;
    return files?.length ? files : null;
  }

  return value;
}

export function setNodeValue(node: InputFieldElement, value: unknown): void {
  if (node.type === 'checkbox' || node.type === 'radio') {
    // eslint-disable-next-line no-param-reassign
    (node as HTMLInputElement).checked = Boolean(value);
    return;
  }

  // eslint-disable-next-line no-param-reassign
  node.value = String(value);
}

export function collectNamedNodes(node: Element, list: Element[]): void {
  if (node.hasAttribute('name')) {
    list.push(node);
  }
  list.splice(list.length, 0, ...Array.from(node.querySelectorAll('[name]')));
}

export type ArrayNodeCache = Record<string, Element[]>;

export function cacheArrayNodes(formElement: HTMLFormElement): ArrayNodeCache {
  const caches: ArrayNodeCache = {};

  formElement.querySelectorAll('[name$="[]"]').forEach((node) => {
    const name = node.getAttribute('name');
    if (!name) {
      return;
    }
    let cache = caches[name];
    if (!cache) {
      cache = [];
      caches[name] = cache;
    }
    cache.push(node);
  });

  return caches;
}

export function getArrayNodeIndex(node: Element, caches: ArrayNodeCache): number {
  const name = node.getAttribute('name');
  let index = -1;
  if (name) {
    index = caches[name].findIndex((el) => el === node);
  }
  if (index === -1) {
    // eslint-disable-next-line no-console
    console.error(`Could not find index for node: ${node.outerHTML}`);
  }
  return index;
}
