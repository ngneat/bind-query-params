<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>

<br />

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
[![ngneat](https://img.shields.io/badge/@-ngneat-383636?style=flat-square&labelColor=8f68d4)](https://github.com/ngneat/)
[![spectator](https://img.shields.io/badge/tested%20with-spectator-2196F3.svg?style=flat-square)]()
![CI](https://github.com/ngneat/bind-query-params/workflows/Bind%20query%20params/badge.svg?branch=master)

> Sync URL Query Params with Angular Form Controls

The library provides a simple and reusable solution for binding URL query params to Angular Forms

## Demo

<img src="./demo.gif">

## Installation

`npm install @ngneat/bind-query-params`

## Usage

Inject the `BindQueryParamsFactory` provider, pass an array of [definitions](#QueryParamDefinition) and `connect` it to your form:

<!-- prettier-ignore -->
```ts
import { BindQueryParamsFactory } from '@ngneat/bind-query-params';

interface Filters {
  searchTerm: string;
  someBoolean: boolean;
}

@Component({
  template: `Your normal form setup`,
})
export class MyComponent {
  filters = new FormGroup({
    searchTerm: new FormControl(),
    someBoolean: new FormControl(false),
  });

  bindQueryParamsManager = this.factory
    .create<Filters>([
      { queryKey: 'searchTerm' },
      { queryKey: 'someBoolean', type: 'boolean' }
     ]).connect(this.filters);

  constructor(private factory: BindQueryParamsFactory) {}

  ngOnDestroy() {
    this.bindQueryParamsManager.destroy();
  }
}
```

With this setup, the `manager` will take care of two things:

1. Update the `control`'s value when the page is loaded for the first time
2. Update the URL query parameter when the corresponding `control` value changes

## QueryParam Definition

### `queryKey`

The query parameter key

### `path`

The form control path. If it is not specified, the manager assumes that the `path` is the `queryKey`. We can also pass nested keys, for example, `person.name`:

```ts
{ queryKey: 'name', path: 'person.name' }
```

### `type`

Specify the control value type. Available options are:
`boolean`, `array`, `number`, `string` and `object`.
Before updating the control with the value, the manager will parse it based on the provided `type`.

### `parser`

Provide a custom parser. For example, the default `array` parser converts the value to an `array` of strings. If we need it to be an array of numbers, we can pass the following `parser`:

```ts
const def = { parser: (value) => value.split(',').map((v) => +v) };
```

### `serializer`

Provide a custom serializer. For example, supposing that we have a `FormControl` that carries a Date and we want to persist, in the query params, a custom value, such as a `string` Date, we can do something like the following `serializer`:

```ts
const def = { serializer: (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : (value as string)) };
```


### `syncInitialControlValue`
Set the initial control value in the URL (defaults to `false`)

### `syncInitialQueryParamValue`
Sync the initial query paramater with the form group (defaults to `true`)

#### Handle Async Data
When working with async controls, such as a dropdown list whose options are coming from the server, we cannot update the control immediately. In those cases, you can set `syncInitialQueryParamValue` to `false`, which will force the control value to not be updated when the page loads. 

Once the data is available, we can call the `manager.syncDefs()` or `manager.syncAllDefs()` methods to update the controls based on the current query parameters:

```ts
@Component()
export class MyComponent {
  filters = new FormGroup({
    searchTerm: new FormControl(),
    users: new FormControl([]),
    someBoolean: new FormControl(false),
  });

  bindQueryParamsManager = this.factory
    .create<Filters>([
      { queryKey: 'searchTerm' },
      { queryKey: 'someBoolean', type: 'boolean' },
      { queryKey: 'users', type: 'array', syncInitialQueryParamValue: false },
    ])
    .connect(this.filters);

  constructor(private factory: BindQueryParamsFactory) {}

  ngOnInit() {
    service.getUsers().subscribe((users) => {
      // Initalize the dropdown
      this.users = users;
      // Sync specific controls use:
      this.manager.syncDefs('users');
      // Sync all controls
      this.manager.syncAllDefs();
    });
  }

  ngOnDestroy() {
    this.bindQueryParamsManager.destroy();
  }
}
```

Note that `syncDefs` will always be called once under the hood.

## Browser Support

The library uses the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) API, which supported in any browser except IE.
