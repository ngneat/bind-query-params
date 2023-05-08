import { InjectionToken } from '@angular/core';
import { BindQueryParamsOptions } from './types';

export const BIND_QUERY_PARAMS_OPTIONS = new InjectionToken<BindQueryParamsOptions>('BIND_QUERY_PARAMS_OPTIONS', {
  providedIn: 'root',
  factory() {
    return {
      windowRef: window,
    };
  },
});
