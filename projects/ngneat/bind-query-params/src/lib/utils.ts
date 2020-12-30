import { AbstractControl } from '@angular/forms';
import { ParamDefType, QueryParamDef } from './services';

export function parse(value: any, type: ParamDefType) {
  switch (type) {
    case 'string':
      return value;
    case 'boolean':
      return value === 'false' ? false : !!value;
    case 'array':
      return value?.split(',');
    case 'number':
      return +value;
    default:
      return value;
  }
}

export function get(obj: object, path: string): any {
  let current = obj;
  path.split('.').forEach((p) => (current = current[p]));

  return current;
}

interface ResolveParamsOption {
  value: any;
  queryKey: string;
}

export function resolveParams(params: ResolveParamsOption[] | ResolveParamsOption) {
  const toArray = coerceArray(params);

  const result = {};

  toArray.forEach(({ value, queryKey }) => {
    const isEmpty = value === null || value === undefined || !value.toString();
    result[queryKey] = isEmpty ? null : value.toString();
  });

  return result;
}

export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function defsToParams(defs: QueryParamDef[], group: AbstractControl) {
  return defs.map((def) => {
    return {
      queryKey: def.queryKey,
      value: group.get(def.path).value,
    };
  });
}
