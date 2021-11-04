import { BIND_QUERY_PARAMS_OPTIONS, BindQueryParamsFactory } from '@ngneat/bind-query-params';
import { FormControl, FormGroup } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { QueryParamParams } from './types';
import { Subject } from 'rxjs';

function stubQueryParams({ search, location }: { search?: string; location?: any }) {
  return {
    provide: BIND_QUERY_PARAMS_OPTIONS,
    useValue: {
      windowRef: {
        location: location || { search: `?${search}` },
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

  resetRouter(spectator);
}

function skipInitialSync(spectator: Spectator<HomeComponent>) {
  tick();
  resetRouter(spectator);
}

function resetRouter(spectator: Spectator<HomeComponent>) {
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

  constructor(public factory: BindQueryParamsFactory) {}

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
  const routeNavigateSubject = new Subject();
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
          navigate: jasmine
            .createSpy('Router.navigate')
            .and.callFake((_, { queryParams }) => routeNavigateSubject.next(queryParams)),
          url: jasmine.createSpy('Router.url'),
        },
      },
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: routeNavigateSubject.asObservable(),
        },
      },
    ],
  });

  afterEach(() => {
    spectator.component.bindQueryParams.destroy();
    resetRouter(spectator);
  });

  describe('BindQueryParams', () => {
    describe('isActive', () => {
      it('should return whether the URL contains the provided key', fakeAsync(() => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'searchTerm=term' })],
        });

        tick();

        const active = spectator.component.bindQueryParams.paramExists('searchTerm');
        expect(active).toBeTrue();

        const notActive = spectator.component.bindQueryParams.paramExists('showErrors');
        expect(notActive).toBeFalse();
      }));

      it('should return whether the URL contains some of the provided keys', fakeAsync(() => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'searchTerm=term' })],
        });
        tick();

        const active = spectator.component.bindQueryParams.someParamExists();
        expect(active).toBeTrue();
      }));
    });

    describe('string', () => {
      it('control => query', fakeAsync(() => {
        spectator = createComponent();

        skipInitialSync(spectator);

        spectator.component.group.patchValue({
          searchTerm: 'term',
        });

        tick();

        assertRouterCall(spectator, { searchTerm: 'term' });
      }));

      it('control => query (with a key that has brackets)', fakeAsync(() => {
        spectator = createComponent();

        skipInitialSync(spectator);

        spectator.component.group.patchValue({
          'withBrackets[gte]': 'aa',
        });

        tick();

        assertRouterCall(spectator, { 'withBrackets[gte]': 'aa' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'searchTerm=term' })],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            searchTerm: 'term',
          })
        );
      });

      it('query => control (with a key that has brackets)', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'withBrackets[gte]=bb' })],
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

        skipInitialSync(spectator);

        spectator.component.group.patchValue({
          showErrors: true,
        });

        tick();

        assertRouterCall(spectator, { showErrors: 'true' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'showErrors=true' })],
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

        skipInitialSync(spectator);

        spectator.component.group.patchValue({
          issues: [1, 2, 3],
        });

        tick();

        assertRouterCall(spectator, { issues: '1,2,3' });
      }));

      it('query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'issues=1,2,3' })],
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

        skipInitialSync(spectator);

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
          providers: [stubQueryParams({ search: 'nested=value&nestedarray=1,2' })],
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

        skipInitialSync(spectator);

        spectator.component.group.patchValue({
          modelToUrl: [1, 2, 3],
        });

        tick();

        assertRouterCall(spectator, { modelToUrl: '1,2,3' });
      }));

      it('should NOT query => control', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3' })],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
          })
        );
      });

      it('should remove the query params when the value is empty', fakeAsync(() => {
        spectator = createComponent();

        skipInitialSync(spectator);

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
          providers: [stubQueryParams({ search: 'parser=1,2,3' })],
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

        skipInitialSync(spectator);

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

        skipInitialSync(spectator);

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
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3' })],
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

        expect(spectator.component.group.patchValue).toHaveBeenCalledTimes(1);
      });

      it('should sync the controls values based on the query params value', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3&modelToUrl2=1,2' })],
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
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3&modelToUrl2=1,2' })],
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

    describe('syncAllDefs', () => {
      it('should sync all control values ONCE based on the query param value', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3&modelToUrl2=4,5,6' })],
        });

        spyOn(spectator.component.group, 'patchValue').and.callThrough();

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
          })
        );

        spectator.component.bindQueryParams.syncAllDefs();

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: ['1', '2', '3'],
            modelToUrl2: ['4', '5', '6'],
          })
        );

        spectator.component.bindQueryParams.syncDefs('modelToUrl');

        expect(spectator.component.group.patchValue).toHaveBeenCalledTimes(1);
      });

      it('should sync all controls values based on the query params value', () => {
        spectator = createComponent({
          providers: [stubQueryParams({ search: 'modelToUrl=1,2,3&modelToUrl2=1,2' })],
        });

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: [],
            modelToUrl2: [],
          })
        );

        spectator.component.bindQueryParams.syncAllDefs();

        expect(spectator.component.group.value).toEqual(
          jasmine.objectContaining({
            modelToUrl: ['1', '2', '3'],
            modelToUrl2: ['1', '2'],
          })
        );
      });
    });
  });

  describe('Strategies', () => {
    describe('TwoWay', () => {
      it('should sync url with control initial value', fakeAsync(() => {
        spectator = createComponent();

        skipInitialSync(spectator);

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

      it('should sync url to model on query param changes', fakeAsync(() => {
        const controlName: keyof Params = 'showErrors';
        function updateQueryParam(value: boolean) {
          spectator.inject(Router).navigate('', {
            queryParams: { [controlName]: value },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          tick();
        }

        function assertControl(value: boolean) {
          expect(spectator.component.group.get(controlName)!.value).toEqual(value);
        }

        const location = { search: '' };
        spectator = createComponent({
          providers: [stubQueryParams({ location })],
        });
        tick();

        [true, false, true].forEach((value) => {
          location.search = `?${controlName}=${value}`;
          updateQueryParam(value);
          assertControl(value);
        });

        spectator.inject(Router).navigate.calls.reset();
      }));
    });

    describe('ModelToUrl', () => {
      const searchTerm = 'initial value';

      function assertModelToUrl(def: Partial<QueryParamParams<Params>> = {}) {
        spectator = createComponent();

        skipInitialSync(spectator);

        spectator.component.group = new FormGroup({
          searchTerm: new FormControl(searchTerm),
        });
        spectator.component.bindQueryParams = spectator.component.factory
          .create<Params>([{ queryKey: 'searchTerm', strategy: 'modelToUrl', ...def }])
          .connect(spectator.component.group);

        tick();
      }

      it('should sync url with control initial value when passing syncInitialValue', fakeAsync(() => {
        assertModelToUrl({ syncInitialValue: true });
        assertRouterCall(spectator, { searchTerm });
      }));

      it('should not sync url with control initial value by default', fakeAsync(() => {
        assertModelToUrl();
        expect(spectator.inject(Router).navigate).not.toHaveBeenCalled();
      }));
    });
  });

  describe('removeEmptyValue', () => {
    const emptyString = '';
    const emptyObject = {};
    const emptyArray: any[] = [];

    interface EmptyValuesParams {
      string: string;
      object: string;
      array: boolean;
    }

    it('should remove empty value from url', fakeAsync(() => {
      spectator = createComponent();
      tick();
      skipInitialSync(spectator);
      spectator.component.group = new FormGroup({
        string: new FormControl(emptyString),
        object: new FormControl(emptyObject),
        array: new FormControl(emptyArray),
      });
      // @ts-ignore
      spectator.component.bindQueryParams = spectator.component.factory
        .create<EmptyValuesParams>([
          { queryKey: 'string', type: 'string' },
          { queryKey: 'object', type: 'object' },
          { queryKey: 'array', type: 'array' },
        ])
        .connect(spectator.component.group);

      tick();

      assertRouterCall(spectator, {
        string: null,
        object: null,
        array: null,
      });

      expect(spectator.inject(Router).navigate).not.toHaveBeenCalled();
    }));

    it('should not remove empty value from url', fakeAsync(() => {
      spectator = createComponent();
      tick();
      skipInitialSync(spectator);
      spectator.component.group = new FormGroup({
        string: new FormControl(emptyString),
        object: new FormControl(emptyObject),
        array: new FormControl(emptyArray),
      });
      // @ts-ignore
      spectator.component.bindQueryParams = spectator.component.factory
        .create<EmptyValuesParams>([
          { queryKey: 'string', type: 'string', removeEmptyValue: false },
          { queryKey: 'object', type: 'object', removeEmptyValue: false },
          { queryKey: 'array', type: 'array', removeEmptyValue: false },
        ])
        .connect(spectator.component.group);

      tick();
      // @ts-ignore
      const stringDef = spectator.component.bindQueryParams.getDef('string');
      // @ts-ignore
      const objectDef = spectator.component.bindQueryParams.getDef('object');
      // @ts-ignore
      const arrayDef = spectator.component.bindQueryParams.getDef('array');

      assertRouterCall(spectator, {
        // @ts-ignore
        string: stringDef.serialize(emptyString),
        // @ts-ignore
        object: objectDef.serialize(emptyObject),
        // @ts-ignore
        array: arrayDef.serialize(emptyArray),
      });

      expect(spectator.inject(Router).navigate).not.toHaveBeenCalled();
    }));
  });
});
