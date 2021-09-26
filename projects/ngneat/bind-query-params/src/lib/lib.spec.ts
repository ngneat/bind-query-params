import { BIND_QUERY_PARAMS_OPTIONS, BindQueryParamsFactory } from '@ngneat/bind-query-params';
import { FormControl, FormGroup } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { Location } from '@angular/common';

function stubQueryParams(params: string) {
  return {
    provide: BIND_QUERY_PARAMS_OPTIONS,
    useValue: {
      windowRef: {
        location: {
          search: `?${params}`,
        },
      },
    },
  };
}

function assertRouterCall(spectator: Spectator<HomeComponent>, queryParams: Record<string, unknown>) {
  expect(spectator.inject(Router).navigate).toHaveBeenCalledOnceWith([], {
    queryParams,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });

  spectator.inject(Router).navigate.calls.reset();
}

interface Params {
  searchTerm: string;
  'withBrackets[gte]': string;
  showErrors: boolean;
  issues: string;
  nested: string;
  nestedarray: string;
  modelToUrl: string;
  modelToUrl2: string;
  parser: string;
  serializer: Date;
}
@Component({
  template: '',
})
class HomeComponent {
  group = new FormGroup({
    searchTerm: new FormControl(),
    'withBrackets[gte]': new FormControl(),
    showErrors: new FormControl(false),
    issues: new FormControl([]),
    modelToUrl: new FormControl([]),
    modelToUrl2: new FormControl([]),
    a: new FormGroup({
      b: new FormControl(),
      c: new FormControl([]),
    }),
    parser: new FormControl([]),
    serializer: new FormControl(),
  });

  constructor(public factory: BindQueryParamsFactory, public location: Location) {}

  bindQueryParams = this.factory
    .create<Params>([
      { queryKey: 'searchTerm' },
      { queryKey: 'withBrackets[gte]' },
      { queryKey: 'showErrors', type: 'boolean' },
      { queryKey: 'issues', type: 'array' },
      { queryKey: 'nested', path: 'a.b' },
      { queryKey: 'nestedarray', path: 'a.c', type: 'array' },
      { queryKey: 'parser', type: 'array', parser: (value) => value.split(',').map((v) => +v) },
      {
        queryKey: 'serializer',
        parser: (value) => new Date(value),
        serializer: (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : (value as any)),
      },
      { queryKey: 'modelToUrl', type: 'array', strategy: 'modelToUrl' },
      { queryKey: 'modelToUrl2', type: 'array', strategy: 'modelToUrl' },
    ])
    .connect(this.group);
}

describe('BindQueryParams', () => {
  let spectator: Spectator<HomeComponent>;
  const createComponent = createComponentFactory({
    component: HomeComponent,
    providers: [
      {
        provide: BIND_QUERY_PARAMS_OPTIONS,
        useValue: {
          windowRef: window,
        },
      },
      {
        provide: Router,
        useValue: {
          navigate: jasmine.createSpy('Router.navigate').and.callFake(([res]) => {
            if (res) {
              const { controlName, value } = res;
              spectator.component.group.get(controlName)!.patchValue(value);
            }
          }),
          url: jasmine.createSpy('Router.url'),
          events: {
            pipe: () => {
              return {
                subscribe: () => {},
              };
            },
          },
        },
      },
    ],
  });

  afterEach(() => {
    spectator.component.bindQueryParams.destroy();
  });

  describe('BindQueryParams', () => {
    describe('isActive', () => {
      it('should return whether the URL contains the provided key', fakeAsync(() => {
        spectator = createComponent({
          providers: [stubQueryParams('searchTerm=term')],
        });

        tick();

        const active = spectator.component.bindQueryParams.paramExists('searchTerm');
        expect(active).toBeTrue();

        const notActive = spectator.component.bindQueryParams.paramExists('showErrors');
        expect(notActive).toBeFalse();
      }));

      it('should return whether the URL contains some of the provided keys', fakeAsync(() => {
        spectator = createComponent({
          providers: [stubQueryParams('searchTerm=term')],
        });
        tick();

        const active = spectator.component.bindQueryParams.someParamExists();
        expect(active).toBeTrue();
      }));
    });

    describe('string', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          searchTerm: 'term',
        });

        tick();

        assertRouterCall(spectator, { searchTerm: 'term' });
      }));

      it('control => query (with a key that has brackets)', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          'withBrackets[gte]': 'aa',
        });

        tick();

        assertRouterCall(spectator, { 'withBrackets[gte]': 'aa' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams('searchTerm=term')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            searchTerm: 'term',
          })
        );
      });

      it('query => control (with a key that has brackets)', () => {
        spectator = createComponent({
          providers: [stubQueryParams('withBrackets[gte]=bb')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            'withBrackets[gte]': 'bb',
          })
        );
      });
    });

    describe('boolean', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          showErrors: true,
        });

        tick();

        assertRouterCall(spectator, { showErrors: 'true' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams('showErrors=true')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            showErrors: true,
          })
        );
      });
    });

    describe('array', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          issues: [1, 2, 3],
        });

        tick();

        assertRouterCall(spectator, { issues: '1,2,3' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams('issues=1,2,3')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            issues: ['1', '2', '3'],
          })
        );
      });
    });

    describe('nested control', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          a: {
            b: 'value',
            c: [1, 2],
          },
        });

        tick();

        assertRouterCall(spectator, { nested: 'value', nestedarray: '1,2' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams('nested=value&nestedarray=1,2')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            a: {
              b: 'value',
              c: ['1', '2'],
            },
          })
        );
      });
    });

    describe('modelToUrl', () => {
      it('should only persist control => url', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          modelToUrl: [1, 2, 3],
        });

        tick();

        assertRouterCall(spectator, { modelToUrl: '1,2,3' });
      }));

      it('should NOT query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams('modelToUrl=1,2,3')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
          })
        );
      });

      it('should remove the query params when the value is empty', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          searchTerm: 'foo',
        });

        tick();

        assertRouterCall(spectator, { searchTerm: 'foo' });

        spectator.component.group.patchValue({
          searchTerm: '',
        });

        tick();

        assertRouterCall(spectator, { searchTerm: null });
      }));
    });

    describe('Custom parser', () => {
      it('should allow custom parser', () => {
        spectator = createComponent({
          providers: [stubQueryParams('parser=1,2,3')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            parser: [1, 2, 3],
          })
        );
      });
    });

    describe('Custom serializer', () => {
      it('should allow custom serializer', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          serializer: new Date('2012-10-10'),
        });

        tick();

        assertRouterCall(spectator, { serializer: '2012-10-10' });
      }));
    });

    describe('Multiple updates', () => {
      it('should aggregate multiple updates', fakeAsync(() => {
        spectator = createComponent();

        tick();
        spectator.inject(Router).navigate.calls.reset();

        spectator.component.group.patchValue({
          issues: [1, 2, 3],
          searchTerm: 'new',
          showErrors: true,
        });

        tick();

        assertRouterCall(spectator, { issues: '1,2,3', searchTerm: 'new', showErrors: 'true' });
      }));
    });

    describe('syncDefs', () => {
      it('should sync the control value ONCE based on the query param value', () => {
        spectator = createComponent({
          providers: [stubQueryParams('modelToUrl=1,2,3')],
        });

        spyOn(spectator.component.group, 'patchValue').and.callThrough();

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
          })
        );

        spectator.component.bindQueryParams.syncDefs('modelToUrl');

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: ['1', '2', '3'],
          })
        );

        spectator.component.bindQueryParams.syncDefs('modelToUrl');
        spectator.component.bindQueryParams.syncDefs('modelToUrl');

        expect(spectator.component.group.patchValue).toHaveBeenCalledTimes(1);
      });

      it('should sync the controls values based on the query params value', () => {
        spectator = createComponent({
          providers: [stubQueryParams('modelToUrl=1,2,3&modelToUrl2=1,2')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
            modelToUrl2: [],
          })
        );

        spectator.component.bindQueryParams.syncDefs(['modelToUrl', 'modelToUrl2']);

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: ['1', '2', '3'],
            modelToUrl2: ['1', '2'],
          })
        );
      });

      it('should allow sync different controls in different times', () => {
        spectator = createComponent({
          providers: [stubQueryParams('modelToUrl=1,2,3&modelToUrl2=1,2')],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
            modelToUrl2: [],
          })
        );

        spectator.component.bindQueryParams.syncDefs('modelToUrl');

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: ['1', '2', '3'],
          })
        );

        spectator.component.bindQueryParams.syncDefs('modelToUrl2');

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl2: ['1', '2'],
          })
        );
      });
    });
  });

  describe('config', () => {
    it('should sync url with control initial value when two-way', fakeAsync(() => {
      spectator = createComponent();

      tick();
      spectator.inject(Router).navigate.calls.reset();

      const searchTerm = 'initial value';
      spectator.component.group = new FormGroup({
        searchTerm: new FormControl(searchTerm),
      });
      spectator.component.bindQueryParams = spectator.component.factory
        .create<Params>([{ queryKey: 'searchTerm' }])
        .connect(spectator.component.group);

      tick();
      assertRouterCall(spectator, { searchTerm });
    }));

    it('should sync url with control initial value when model-to-url', fakeAsync(() => {
      spectator = createComponent();

      tick();
      spectator.inject(Router).navigate.calls.reset();

      const searchTerm = 'initial value';
      spectator.component.group = new FormGroup({
        searchTerm: new FormControl(searchTerm),
      });
      spectator.component.bindQueryParams = spectator.component.factory
        .create<Params>([{ queryKey: 'searchTerm', strategy: 'modelToUrl', syncInitialValue: true }])
        .connect(spectator.component.group);

      tick();
      assertRouterCall(spectator, { searchTerm });
    }));

    it('should not sync url with control initial value when model-to-url', fakeAsync(() => {
      spectator = createComponent();

      tick();
      spectator.inject(Router).navigate.calls.reset();

      const searchTerm = 'initial value';
      spectator.component.group = new FormGroup({
        searchTerm: new FormControl(searchTerm),
      });
      spectator.component.bindQueryParams = spectator.component.factory
        .create<Params>([{ queryKey: 'searchTerm', strategy: 'modelToUrl' }])
        .connect(spectator.component.group);

      tick();
      expect(spectator.inject(Router).navigate).not.toHaveBeenCalled();
    }));

    it('should sync url to model after changes', fakeAsync(() => {
      spectator = createComponent();

      spectator.inject(Router).navigate([{ controlName: 'showErrors', value: true }], {
        queryParams: { showErrors: true },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      tick();
      expect(spectator.component.group.get('showErrors')!.value).toEqual(true);

      spectator.inject(Router).navigate([{ controlName: 'showErrors', value: false }], {
        queryParams: { showErrors: false },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      tick();
      expect(spectator.component.group.get('showErrors')!.value).toEqual(false);

      spectator.inject(Router).navigate([{ controlName: 'showErrors', value: true }], {
        queryParams: { showErrors: true },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      tick();
      expect(spectator.component.group.get('showErrors')!.value).toEqual(true);

      spectator.inject(Router).navigate.calls.reset();
    }));
  });
});
