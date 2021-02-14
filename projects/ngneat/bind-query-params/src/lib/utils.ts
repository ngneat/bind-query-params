import { AbstractControl } from '@angular/forms';
import { ParamDefType } from './types';
import { QueryParamDef } from './QueryParamDef';

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
    case 'object':
      return JSON.parse(value);
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
  def: QueryParamDef;
  value: any;
}

export function resolveParams(params: ResolveParamsOption[] | ResolveParamsOption) {
  const toArray = coerceArray(params);

  const result = {};

  toArray.forEach(({ def: { queryKey, serializer }, value }) => {
    const serializedValue = serializer?.(value) || value?.toString();
    result[queryKey] = serializedValue || null;
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
