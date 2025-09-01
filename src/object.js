import {
  buildNamePath,
  parseNamePath,
} from './name';

export function setObjectValue(obj, nameArg, value, del = false) {
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

    setObjectValue(obj[name], buildNamePath(path), value, del);
    return;
  }

  if (del) {
    if (Array.isArray(obj)) {
      obj.splice(name, 1);
      return;
    }

    // eslint-disable-next-line no-param-reassign
    delete obj[name];
    return;
  }

  // eslint-disable-next-line no-param-reassign
  obj[name] = value;
}

export function getObjectValue(obj, nameArg) {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      return undefined;
    }

    return getObjectValue(obj[name], buildNamePath(path));
  }

  return obj[name];
}

export function hasObjectValue(obj, nameArg) {
  const [name, ...path] = parseNamePath(nameArg);

  if (path.length > 0) {
    if (!obj[name]) {
      return false;
    }

    return hasObjectValue(obj[name], buildNamePath(path));
  }

  return name in obj;
}
