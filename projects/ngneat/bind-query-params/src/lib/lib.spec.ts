import { BIND_QUERY_PARAMS_OPTIONS, BindQueryParamsFactory } from '@ngneat/bind-query-params';
import { FormControl, FormGroup } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';

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

function assertRouterCall(spectator, queryParams) {
  expect(spectator.inject(Router).navigate).toHaveBeenCalledOnceWith([], {
    queryParams,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });

  spectator.inject(Router).navigate.calls.reset();
}

interface Params {
  searchTerm: string;
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

  constructor(private factory: BindQueryParamsFactory) {}

  bindQueryParams = this.factory
    .create<Params>([
      { queryKey: 'searchTerm' },
      { queryKey: 'showErrors', type: 'boolean' },
      { queryKey: 'issues', type: 'array' },
      { queryKey: 'nested', path: 'a.b' },
      { queryKey: 'nestedarray', path: 'a.c', type: 'array' },
      { queryKey: 'parser', type: 'array', parser: (value) => value.split(',').map((v) => +v) },
      {
        queryKey: 'serializer',
        parser: (value) => new Date(value),
        serializer: (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : (value as string)),
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
          navigate: jasmine.createSpy('Router.navigate'),
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

        const active = spectator.component.bindQueryParams.paramExists('searchTerm');
        expect(active).toBeTrue();

        const notActive = spectator.component.bindQueryParams.paramExists('showErrors');
        expect(notActive).toBeFalse();
      }));
    });

    describe('string', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        spectator.component.group.patchValue({
          searchTerm: 'term',
        });

        tick();

        assertRouterCall(spectator, { searchTerm: 'term' });
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
    });

    describe('boolean', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

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

      describe('Custom serializer', () => {
        it('should allow custom serializer', fakeAsync(() => {
          spectator = createComponent();

          spectator.component.group.patchValue({
            serializer: new Date('2012-10-10'),
          });

          tick();

          assertRouterCall(spectator, { serializer: '2012-10-10' });
        }));
      });
    });

    describe('Multiple updates', () => {
      it('should aggregate multiple updates', fakeAsync(() => {
        spectator = createComponent();

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
});
