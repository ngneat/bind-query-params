import { Inject, Injectable, inject, Injector, DestroyRef, assertInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { BindQueryParamsManager } from './bind-query-params-manager';
import { BIND_QUERY_PARAMS_OPTIONS } from './options';
import { BindQueryParamsOptions, CreateOptions, QueryDefOptions } from './types';

@Injectable({ providedIn: 'root' })
export class BindQueryParamsFactory {
  private router = inject(Router);
  private options = inject(BIND_QUERY_PARAMS_OPTIONS);

  create<T>(defs: QueryDefOptions<T>[] | QueryDefOptions<T>, options?: CreateOptions): BindQueryParamsManager<T> {
    !options?.injector && assertInInjectionContext(this.create);
    const injector = options?.injector ?? inject(Injector);
    const manager = new BindQueryParamsManager<T>(this.router, defs, this.options, options);

    injector.get(DestroyRef).onDestroy(() => manager.destroy());

    return manager;
  }
}
