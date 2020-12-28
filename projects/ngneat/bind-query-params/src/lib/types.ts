import { InjectionToken } from '@angular/core';
import { coerceArray, parse } from './utils';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string';

type QueryParamParams<QueryParams = any> = {
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  trigger?: 'change' | 'submit';
  strategy?: 'modelToUrl' | 'twoWay';
  hasDefaultValue?: boolean;
};

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

  get strategy() {
    return this.config.strategy || 'twoWay';
  }

  get hasDefaultValue() {
    return this.config.hasDefaultValue || false;
  }

  parse(queryParamValue: string) {
    return parse(queryParamValue, this.type);
  }
}

export class BindQueryParamsManager<T = any> {
  defs: QueryParamDef<T>[];

  constructor(defs: QueryParamParams<T>[] | QueryParamDef<T>) {
    this.defs = coerceArray(defs).map((def) => new QueryParamDef(def));
  }

  getDef(queryKey: keyof T) {
    return this.defs.find((def) => def.queryKey === queryKey);
  }

  parse(queryParams: Partial<Record<keyof T, string>>) {
    const result = {};

    for (const [key, value] of Object.entries(queryParams)) {
      const def = this.getDef(key as keyof T);

      if (def) {
        result[key] = this.getDef(key as keyof T).parse(value as any);
      }
    }

    return result;
  }
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
