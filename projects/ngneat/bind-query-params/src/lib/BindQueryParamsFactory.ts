import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BindQueryParamsManager } from './BindQueryParamsManager';
import { BIND_QUERY_PARAMS_OPTIONS } from './options';
import { BindQueryParamsOptions, QueryParamParams } from './types';

@Injectable({ providedIn: 'root' })
export class BindQueryParamsFactory {
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    @Inject(BIND_QUERY_PARAMS_OPTIONS) private options: BindQueryParamsOptions
  ) {}

  create<T>(defs: QueryParamParams<T>[] | QueryParamParams<T>): BindQueryParamsManager<T> {
    return new BindQueryParamsManager<T>(this.router, this.activeRoute, defs, this.options);
  }
}
