import { FormGroup } from '@angular/forms';
import { ParamDefType, QueryParamDef } from './types';

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

export function resolveParams(defs: QueryParamDef[], formValue: object, group: FormGroup) {
  const result = {};

  defs.forEach((def) => {
    const dirty = group.get(def.path).dirty;

    if (dirty) {
      const value = get(formValue, def.path as string);
      result[def.queryKey] = value || typeof value === 'boolean' ? value.toString() : null;
    }
  });

  return result;
}
