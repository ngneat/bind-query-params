import { ParamDefType, QueryParamDef } from './types';

export function parse(value: any, type: ParamDefType) {
  switch (type) {
    case 'string':
      return value;
    case 'boolean':
      return value === 'false' ? false : !!value;
    case 'array':
      return value?.join(',');
    case 'number':
      return +value;
    default:
      return value;
  }
}

export function get(obj: object, path: string) {
  return path.split('.').reduce((p, c) => (p && p[c]) || null, obj);
}

export function resolveParams(defs: QueryParamDef[], formValue: object) {
  const params: Record<string, any> = {};

  for (const def of defs) {
    const value = get(formValue, def.path as string);
    params[def.queryKey as string] = Array.isArray(value) ? value.toString() : value;
  }

  return params;
}
