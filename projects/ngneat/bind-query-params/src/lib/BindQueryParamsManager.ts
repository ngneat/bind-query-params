import { FormGroup } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { coerceArray, get, resolveParams } from './utils';
import { auditTime, map, takeUntil } from 'rxjs/operators';
import { BindQueryParamsOptions, QueryDefOptions, ResolveParamsOption, SyncDefsOptions } from './types';
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
    defs: QueryDefOptions<T>[] | QueryDefOptions<T>,
    private options: BindQueryParamsOptions,
    private createOptions?: Pick<QueryDefOptions, 'syncInitialControlValue' | 'syncInitialQueryParamValue'>
  ) {
    this.defs = coerceArray(defs).map((def) => new QueryParamDef(def));
  }

  onInit() {
    this.handleInitialURLSync();

    this.updateControl(
      this.defs,
      { emitEvent: true },
      (def) => !!(def.syncInitialQueryParamValue ?? this.createOptions?.syncInitialQueryParamValue)
    );

    const controls = this.defs.map((def) => {
      return this.group.get(def.path)!.valueChanges.pipe(
        map((value) => ({
          def,
          value,
        }))
      );
    });

    // Could be a several changes in the same tick,
    // for example when we use reset() or patchValue.
    // We need to aggregate the changes and apply them once
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
    return this.search.has(queryKey as string);
  }

  someParamExists(): boolean {
    return this.defs.some((def) => {
      return this.search.has(def.queryKey);
    });
  }

  get search() {
    return new URLSearchParams(this.options.windowRef.location.search);
  }

  private handleInitialURLSync() {
    const initialSyncDefs: Parameters<typeof resolveParams>[0] = [];

    for (const def of this.defs) {
      const syncInitialControlValue = def.syncInitialControlValue ?? this.createOptions?.syncInitialControlValue;

      if (syncInitialControlValue && !this.paramExists(def.queryKey)) {
        initialSyncDefs.push({ def, value: get(this.group.value, def.path) });
      }
    }

    if (initialSyncDefs.length) {
      this.updateQueryParams({
        // The router doesn't know the current query params so
        // we need to add it manually
        ...Object.fromEntries(this.search as any),
        ...resolveParams(initialSyncDefs),
      });
    }
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
        const queryParamValue = queryParams.get(queryKey);

        if (!queryParamValue) continue;

        set(value, def.path.split('.'), def.parse(queryParamValue));
      }
    }

    if (Object.keys(value).length) {
      this.group.patchValue(value, options);
    }
  }
}
