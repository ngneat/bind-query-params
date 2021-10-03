import { FormGroup } from '@angular/forms';
import { merge, Subject, identity } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { coerceArray, resolveParams } from './utils';
import { auditTime, map, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { BindQueryParamsOptions, QueryParamParams, ResolveParamsOption, SyncDefsOptions } from './types';
import { QueryParamDef } from './QueryParamDef';
import set from 'lodash.set';

export class BindQueryParamsManager<T = any> {
  private defs: QueryParamDef<T>[];
  private group!: FormGroup;
  private $destroy = new Subject();
  private defsSynced: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;

  connect(group: FormGroup) {
    this.group = group;
    this.onInit();
    return this;
  }

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    defs: QueryParamParams<T>[] | QueryParamParams<T>,
    private options: BindQueryParamsOptions
  ) {
    this.defs = coerceArray(defs).map((def) => new QueryParamDef(def));
  }

  onInit() {
    this.updateControl(this.defs, { emitEvent: true }, shouldSyncInitialValue);

    const controls = this.defs.map((def) => {
      const control = this.group.get(def.path)!;

      return control.valueChanges.pipe(
        shouldSyncInitialValue(def) ? startWith(control.value) : identity,
        map((value) => ({
          def,
          value,
        }))
      );
    });

    // Could be a several changes in the same tick,
    // for example when we use reset() or patchValue.
    // We need to aggregate the changes and apply them at once
    // because the router navigates in micro task
    let buffer: ResolveParamsOption[] = [];

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

    const twoWaySyncDef: QueryParamDef<T>[] = this.defs.filter(({ strategy }: QueryParamDef) => strategy === 'twoWay');

    if (twoWaySyncDef.length) {
      this.activeRoute.queryParams
        .pipe(pairwise(), takeUntil(this.$destroy))
        .subscribe(([prevQueryParams, curQueryParams]) => {
          let paramsDiff = twoWaySyncDef.filter(
            ({ queryKey }) => prevQueryParams[queryKey] !== curQueryParams[queryKey]
          );

          if (paramsDiff.length) {
            this.updateControl(paramsDiff, { emitEvent: true });
          }
        });
    }
  }

  destroy() {
    this.$destroy.next();
  }

  getDef(queryKey: keyof T) {
    return this.defs.find((def) => def.queryKey === queryKey);
  }

  parse(queryParams: Partial<T>) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(queryParams)) {
      const def = this.getDef(key as keyof T);

      if (def) {
        result[key] = def.parse(value as string);
      }
    }

    return result;
  }

  syncAllDefs(options: SyncDefsOptions = { emitEvent: true }) {
    const allKeys = this.defs.map((def) => def.queryKey);
    this.syncDefs(allKeys, options);
  }

  syncDefs(queryKeys: (keyof T & string) | (keyof T & string)[], options: SyncDefsOptions = { emitEvent: true }) {
    const defs: QueryParamDef<T>[] = [];

    coerceArray(queryKeys).forEach((key) => {
      if (!this.defsSynced[key]) {
        this.defsSynced[key] = true;
        const def = this.getDef(key as keyof T);

        if (def) {
          defs.push(def);
        }
      }
    });

    if (defs.length) {
      this.updateControl(defs, options);
    }
  }

  paramExists(queryKey: keyof T): boolean {
    return new URLSearchParams(this.options.windowRef.location.search).has(queryKey as string);
  }

  someParamExists(): boolean {
    return this.defs.some((def) => {
      return new URLSearchParams(this.options.windowRef.location.search).has(def.queryKey);
    });
  }

  private updateQueryParams(queryParams: object) {
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private updateControl(
    defs: QueryParamDef[],
    options: { emitEvent: boolean },
    updatePredicate = (_: QueryParamDef) => true
  ) {
    const queryParams = new URLSearchParams(this.options.windowRef.location.search);
    let value: Partial<T> = {};

    for (const def of defs) {
      if (updatePredicate(def)) {
        const { queryKey } = def;
        const queryDef = queryParams.get(queryKey);

        if (!queryDef) continue;

        set(value, def.path.split('.'), def.parse(queryDef));
      }
    }

    if (Object.keys(value).length) {
      this.group.patchValue(value, options);
    }
  }
}

function shouldSyncInitialValue(def: QueryParamDef) {
  return def.strategy === 'twoWay' || def.syncInitialValue;
}
