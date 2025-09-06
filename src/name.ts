export function parseNamePath(str: string): string[] {
  let name = str;
  let path: string[] = [];
  const i = str.indexOf('[');
  if (i !== -1) {
    name = str.slice(0, i);
    path = str.slice(i + 1, -1).split('][');
  }
  path.unshift(name);
  return path;
}

export function buildNamePath(arr: string[]): string {
  const [name, ...path] = arr;
  if (!path.length) {
    return name;
  }
  return `${name}[${path.join('][')}]`;
}
