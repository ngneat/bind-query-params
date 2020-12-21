import { InjectionToken } from '@angular/core';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string';

export interface QueryParamParams<QueryParams = any> {
  queryKey: keyof QueryParams;
  path?: string;
  type?: ParamDefType;
  trigger?: 'change' | 'submit';
}

export class QueryParamDef<QueryParams = any> {
  constructor(private config: QueryParamParams<QueryParams>) {}

  get queryKey() {
    return this.config.queryKey;
  }

  get path() {
    return this.config.path || this.queryKey;
  }

  get type() {
    return this.config.type || 'string';
  }

  get trigger() {
    return this.config.trigger || 'change';
  }
}

export function createQueryParamsDefs<Q>(defs: QueryParamParams<Q>[]): QueryParamDef<Q>[] {
  return defs.map((def) => new QueryParamDef(def));
}

export interface BindQueryParamsOptions {
  windowRef: Window;
}

export const BIND_QUERY_PARAMS_OPTIONS = new InjectionToken('BIND_QUERY_PARAMS_OPTIONS', {
  providedIn: 'root',
  factory() {
    return {
      windowRef: window,
    };
  },
});
