import { Inject, Injectable, InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { auditTime, map, takeUntil } from 'rxjs/operators';
import { coerceArray, parse, resolveParams } from './utils';
import set from 'lodash.set';

export type ParamDefType = 'boolean' | 'array' | 'number' | 'string';

type QueryParamParams<QueryParams = any> = {
  queryKey: keyof QueryParams & string;
  path?: string;
  type?: ParamDefType;
  strategy?: 'modelToUrl' | 'twoWay';
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

  get strategy() {
    return this.config.strategy || 'twoWay';
  }

  parse(queryParamValue: string) {
    return parse(queryParamValue, this.type);
  }
}

@Injectable({ providedIn: 'root' })
export class BindQueryParamsFactory {
  constructor(private router: Router, @Inject(BIND_QUERY_PARAMS_OPTIONS) private options: BindQueryParamsOptions) {}

  create<T>(defs: QueryParamParams<T>[] | QueryParamParams<T>, group: FormGroup): BindQueryParamsManager<T> {
    return new BindQueryParamsManager<T>(this.router, this.options).connect(defs, group);
  }
}

export class BindQueryParamsManager<T = any> {
  private defs: QueryParamDef<T>[];
  private group: FormGroup;
  private $destroy = new Subject();

  connect(defs: QueryParamParams<T>[] | QueryParamParams<T>, group: FormGroup) {
    this.defs = coerceArray(defs).map((def) => new QueryParamDef(def));
    this.group = group;
    this.onInit();
    return this;
  }

  constructor(private router: Router, private options: BindQueryParamsOptions) {}

  onInit() {
    const value = this.getInitialValue();

    if (Object.keys(value).length) {
      this.group.patchValue(value);
    }

    const controls = this.defs.map((def) => {
      return this.group.get(def.path).valueChanges.pipe(
        map((value) => ({
          value,
          queryKey: def.queryKey,
        }))
      );
    });

    // Could be a several changes in the same tick,
    // for example when we use reset() or patchValue.
    // We need to aggregate the changes and apply them at once
    // because the router navigates in micro task
    let buffer = [];

    merge(...controls)
      .pipe(
        map((result) => buffer.push(result)),
        auditTime(0),
        takeUntil(this.$destroy)
      )
      .subscribe(() => {
        this.updateQueryParams(resolveParams(buffer));
        buffer = [];
      });
  }

  destroy() {
    this.$destroy.next();
  }

  getDef(queryKey: keyof T) {
    return this.defs.find((def) => def.queryKey === queryKey);
  }

  parse(queryParams: Partial<T>) {
    const result = {};

    for (const [key, value] of Object.entries(queryParams)) {
      const def = this.getDef(key as keyof T);

      if (def) {
        result[key] = this.getDef(key as keyof T).parse(value as any);
      }
    }

    return result;
  }

  private updateQueryParams(queryParams: object) {
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private getInitialValue() {
    const queryParams = new URLSearchParams(this.options.windowRef.location.search);
    let value = {};

    for (const def of this.defs) {
      if (def.strategy === 'twoWay') {
        const queryKey = def.queryKey;

        if (queryParams.has(queryKey as string)) {
          set(value, def.path, def.parse(queryParams.get(queryKey)));
        }
      }
    }

    return value;
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
