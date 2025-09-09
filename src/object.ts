import {
  buildNamePath,
  parseNamePath,
} from './name';

export interface DataObject {
  [key: string]: unknown
}

export function setObjectValue(
  obj: DataObject,
  nameArg: string,
  value: unknown,
  del = false,
): void {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      if (/^[0-9]+$/.test(path[0])) {
        // path part is numeric - treat as array
        // eslint-disable-next-line no-param-reassign
        obj[name] = [];
      } else {
        // path part is string
        // eslint-disable-next-line no-param-reassign
        obj[name] = {};
      }
    }

    setObjectValue(obj[name] as DataObject, buildNamePath(path), value, del);
    return;
  }

  if (del) {
    if (Array.isArray(obj)) {
      const index = parseInt(name, 10);
      if (Number.isNaN(index)) {
        return;
      }
      obj.splice(index, 1);
      return;
    }

    // eslint-disable-next-line no-param-reassign
    delete obj[name];
    return;
  }

  // eslint-disable-next-line no-param-reassign
  obj[name] = value;
}

export function getObjectValue(obj: DataObject, nameArg: string): unknown {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      return undefined;
    }

    return getObjectValue(obj[name] as DataObject, buildNamePath(path));
  }

  return obj[name];
}

export function hasObjectValue(obj: DataObject, nameArg: string): boolean {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      return false;
    }

    return hasObjectValue(obj[name] as DataObject, buildNamePath(path));
  }

  return name in obj;
}
