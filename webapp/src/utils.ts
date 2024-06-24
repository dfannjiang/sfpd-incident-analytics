import { camelCase, isArray, isObject } from "lodash";
import { IncidentFilterProps } from "./types";

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

function formatIncidentFilterStr(incidentFilters: IncidentFilterProps): string {
  let filterStr = "";
  for (let i = 0; i < incidentFilters.categories.length; i++) {
    filterStr += `categories=${incidentFilters.categories[i]}&`;
  }
  if (incidentFilters.timePeriod.length > 0) {
    filterStr += `time_period=${incidentFilters.timePeriod}&`;
  }
  if (incidentFilters.filterOnDaylight != null) {
    filterStr += `is_daylight=${incidentFilters.filterOnDaylight.toString()}&`;
  }

  if (filterStr.length > 0) {
    filterStr = "?" + filterStr.slice(0, -1);
  }
  return filterStr;
}

export { keysToCamelCase, formatIncidentFilterStr };
