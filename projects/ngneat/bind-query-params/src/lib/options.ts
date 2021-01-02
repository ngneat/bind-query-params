import { InjectionToken } from '@angular/core';

export const BIND_QUERY_PARAMS_OPTIONS = new InjectionToken('BIND_QUERY_PARAMS_OPTIONS', {
  providedIn: 'root',
  factory() {
    return {
      windowRef: window,
    };
  },
});
