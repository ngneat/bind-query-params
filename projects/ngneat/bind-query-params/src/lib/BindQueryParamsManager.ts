import { FormGroup } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { coerceArray, resolveParams } from './utils';
import { auditTime, map, takeUntil } from 'rxjs/operators';
import { BindQueryParamsOptions, QueryParamParams } from './types';
import { QueryParamDef } from './QueryParamDef';
import set from 'lodash.set';

export class BindQueryParamsManager<T = any> {
  private defs: QueryParamDef<T>[];
  private group: FormGroup;
  private $destroy = new Subject();

  connect(group: FormGroup) {
    this.group = group;
    this.onInit();
    return this;
  }

  constructor(
    private router: Router,
    defs: QueryParamParams<T>[] | QueryParamParams<T>,
    private options: BindQueryParamsOptions
  ) {
    this.defs = coerceArray(this.defs).map((def) => new QueryParamDef(def));
  }

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
