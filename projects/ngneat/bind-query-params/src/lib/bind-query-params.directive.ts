import { Directive, Inject, Input, ModuleWithProviders, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import set from 'lodash.set';
import { BindQueryParamsManager, BindQueryParamsOptions, BIND_QUERY_PARAMS_OPTIONS } from './types';
import { resolveParams } from './utils';

@Directive({
  selector: '[bindQueryParams]',
})
export class BindQueryParamsDirective implements OnInit, OnDestroy {
  @Input('bindQueryParams') _defs: BindQueryParamsManager;

  private destroy = new Subject();

  constructor(
    private formGroupDirective: ControlContainer,
    private router: Router,
    @Inject(BIND_QUERY_PARAMS_OPTIONS) private options: BindQueryParamsOptions
  ) {}

  get defs() {
    return this._defs.defs;
  }

  ngOnInit() {
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

    this.group.patchValue(value);

    const onSubmitDefs = this.defs.filter((def) => def.trigger === 'submit');
    const onChangeDefs = this.defs.filter((def) => def.trigger === 'change');

    if (onSubmitDefs.length) {
      (this.formGroupDirective as FormGroupDirective).ngSubmit.pipe(takeUntil(this.destroy)).subscribe(() => {
        const params = onSubmitDefs.map((def) => {
          return {
            queryKey: def.queryKey,
            value: this.group.get(def.path).value,
          };
        });

        this.updateQueryParams(resolveParams(params));
      });
    }

    if (onChangeDefs.length) {
      const controls = onChangeDefs.map((def) => {
        return this.group.get(def.path).valueChanges.pipe(
          map((value) => ({
            value,
            queryKey: def.queryKey,
          }))
        );
      });

      merge(...controls)
        .pipe(takeUntil(this.destroy))
        .subscribe((result) => {
          this.updateQueryParams(resolveParams(result));
        });
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
