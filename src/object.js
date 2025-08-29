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
        obj[name] = [];
      } else {
        // path part is string
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

    delete obj[name];
    return;
  }

  obj[name] = value;
}
