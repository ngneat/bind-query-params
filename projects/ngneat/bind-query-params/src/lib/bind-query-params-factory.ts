import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BindQueryParamsManager } from './bind-query-params-manager';
import { BIND_QUERY_PARAMS_OPTIONS } from './options';
import { BindQueryParamsOptions, CreateOptions, QueryDefOptions } from './types';

@Injectable({ providedIn: 'root' })
export class BindQueryParamsFactory {
  constructor(private router: Router, @Inject(BIND_QUERY_PARAMS_OPTIONS) private options: BindQueryParamsOptions) {}

  create<T>(defs: QueryDefOptions<T>[] | QueryDefOptions<T>, createOptions?: CreateOptions): BindQueryParamsManager<T> {
    return new BindQueryParamsManager<T>(this.router, defs, this.options, createOptions);
  }
}
