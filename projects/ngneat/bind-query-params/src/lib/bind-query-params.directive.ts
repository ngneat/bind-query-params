import { Directive, Inject, Input, ModuleWithProviders, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { auditTime, map, takeUntil } from 'rxjs/operators';
import set from 'lodash.set';
import { BIND_QUERY_PARAMS_OPTIONS, BindQueryParamsManager, BindQueryParamsOptions } from './types';
import { resolveParams } from './utils';

// We don't use the Router because we want to get the query params asap
@Directive({
  selector: '[bindQueryParams]',
})
export class BindQueryParamsDirective implements OnInit, OnDestroy {
  @Input('bindQueryParams') manager: BindQueryParamsManager;

  private destroy = new Subject();

  constructor(
    private formGroupDirective: ControlContainer,
    private router: Router,
    @Inject(BIND_QUERY_PARAMS_OPTIONS) private options: BindQueryParamsOptions
  ) {}

  get defs() {
    return this.manager.defs;
  }

  ngOnInit() {
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
        takeUntil(this.destroy)
      )
      .subscribe(() => {
        this.updateQueryParams(resolveParams(buffer));
        buffer = [];
      });

    const value = this.getInitialValue();
    if (Object.keys(value).length) {
      this.group.patchValue(value);
    }
  }

  get group() {
    return this.formGroupDirective.control;
  }

  ngOnDestroy() {
    this.destroy.next();
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

@NgModule({
  exports: [BindQueryParamsDirective],
  declarations: [BindQueryParamsDirective],
})
export class BindQueryParamsModule {
  static forRoot(options?: BindQueryParamsOptions): ModuleWithProviders<BindQueryParamsModule> {
    return {
      ngModule: BindQueryParamsModule,
      providers: [
        {
          provide: BIND_QUERY_PARAMS_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
