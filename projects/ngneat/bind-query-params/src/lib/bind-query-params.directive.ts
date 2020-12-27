import { Directive, Inject, Input, ModuleWithProviders, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import set from 'lodash.set';
import { BindQueryParamsManager, BindQueryParamsOptions, BIND_QUERY_PARAMS_OPTIONS } from './types';
import { parse, resolveParams } from './utils';

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
        this.updateQueryParams(resolveParams(onSubmitDefs, this.group.value, this.group as FormGroup), true);
      });
    }

    if (onChangeDefs.length) {
      this.group.valueChanges.pipe(takeUntil(this.destroy)).subscribe((value) => {
        this.updateQueryParams(resolveParams(onChangeDefs, value, this.group as FormGroup));
      });
    }
  }

  get group() {
    return this.formGroupDirective.control;
  }

  ngOnDestroy() {
    this.destroy.next();
  }

  private updateQueryParams(queryParams: object, replaceUrl = false) {
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
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
