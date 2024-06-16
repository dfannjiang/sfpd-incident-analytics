import { camelCase, isArray, isObject } from "lodash";

function keysToCamelCase(obj: any): any {
  if (isArray(obj)) {
    return obj.map(keysToCamelCase);
  } else if (isObject(obj)) {
    obj = obj as Object;
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = camelCase(key);
      result[camelKey] = keysToCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export default keysToCamelCase;
