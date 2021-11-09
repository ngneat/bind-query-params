import { AbstractControl } from '@angular/forms';
import { ParamDefType, ResolveParamsOption } from './types';
import { QueryParamDef } from './QueryParamDef';

function isEmptyValue(def: QueryParamDef, value: any) {
  switch (def.type) {
    case 'array':
      return !!value.length;
    case 'object':
      return !!Object.keys(value).length;
    case 'string':
      return !value || value === '';
    default:
      return false;
  }
}

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

export function get(obj: Record<string, any>, path: string): any {
  let current = obj;
  path.split('.').forEach((p) => (current = current[p]));

  return current;
}

export function resolveParams(params: ResolveParamsOption | ResolveParamsOption[]) {
  const toArray = coerceArray(params);

  const result: Record<string, string | null> = {};

  toArray.forEach(({ def, value }) => {
    let defValue: string | null;

    if (def.removeEmptyValue) {
      defValue = isEmptyValue(def, value) ? null : def.serialize(value);
    } else {
      defValue = def.serialize(value);
    }

    result[def.queryKey] = defValue;
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
      value: group.get(def.path)!.value,
    };
  });
}
