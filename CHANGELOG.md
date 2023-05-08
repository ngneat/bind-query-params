# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0](https://github.com/ngneat/bind-query-params/compare/v5.1.0...v6.0.0) (2023-05-08)


### ⚠ BREAKING CHANGES

* 🧨 The library requires angular v16

### Features

* 🎸 auto destroy manager via destroy ref ([0ae016c](https://github.com/ngneat/bind-query-params/commit/0ae016c56381be632b3658c8aea498d8230899bd))


* 🤖 upgrade to ng v16 ([314c707](https://github.com/ngneat/bind-query-params/commit/314c707255e997a9d991f3892331780fa79d8d2c))

## [5.1.0](https://github.com/ngneat/bind-query-params/compare/v5.0.0...v5.1.0) (2023-03-22)


### Features

* 🎸 add reconnect method ([409ad4a](https://github.com/ngneat/bind-query-params/commit/409ad4a4130000d4849ea86022c99550b8d42616))

## [5.0.0](https://github.com/ngneat/bind-query-params/compare/v4.0.0...v5.0.0) (2021-11-25)


### ⚠ BREAKING CHANGES

* **lib:** remove strategy options

The `strategy` option is removed in favor of two options:
`syncInitialControlValue` - Set the initial control value in the URL (defaults to `false`)
`syncInitialQueryParamValue` - Sync the initial query paramater with the form group (defaults to `true`)

`modelToUrl` is now `syncInitialQueryParamValue: false`.

### Features

* 🎸 upgrade to v13 ([e802dc9](https://github.com/ngneat/bind-query-params/commit/e802dc9237c06f46357dbb5be6685588b334e101))
* **lib:** remove strategy options ([b4624f1](https://github.com/ngneat/bind-query-params/commit/b4624f148852c330538e7dda957107ec8b965223))


### Bug Fixes

* 🐛 revert functionality ([445082e](https://github.com/ngneat/bind-query-params/commit/445082eec2fdbd2bd58f6dacd56ec362bdc883c7))

## [4.0.0](https://github.com/ngneat/bind-query-params/compare/v3.0.1...v4.0.0) (2021-11-20)


### ⚠ BREAKING CHANGES

* 🧨 The library requires angular v13

### Features

* 🎸 upgrade to angular v13 ([826f658](https://github.com/ngneat/bind-query-params/commit/826f658cb54467be063885b47e70a0cd2a0e44da))

### [3.0.1](https://github.com/ngneat/bind-query-params/compare/v3.0.0...v3.0.1) (2021-11-16)


### Bug Fixes

* 🐛 add protection for nullish array values ([526eb99](https://github.com/ngneat/bind-query-params/commit/526eb999c5993e38cd18c85b53e6156cbeeb10d9)), closes [#27](https://github.com/ngneat/bind-query-params/issues/27)

## [3.0.0](https://github.com/ngneat/bind-query-params/compare/v2.0.1...v3.0.0) (2021-11-10)


### ⚠ BREAKING CHANGES

* 🧨 From now on, empty control values will be removed from the URL query
params.

### Features

* 🎸 add `removeEmptyValue` config ([096b5df](https://github.com/ngneat/bind-query-params/commit/096b5dfb3435dfa7cfbfb2efb3e5af4568a685b6))


### Bug Fixes

* change 'twoWay' to sync url-> model not only once ([18302d3](https://github.com/ngneat/bind-query-params/commit/18302d32030047389ed6c3eb88c7d894093915db))
* change 'twoWay' to sync url-> model not only once ([a2782a3](https://github.com/ngneat/bind-query-params/commit/a2782a3dc43c6f1c82fedc02089a59cc17187a76))

### [2.0.1](https://github.com/ngneat/bind-query-params/compare/v2.0.0...v2.0.1) (2021-10-06)


### Bug Fixes

* 🐛 match signature of custom serializer ([83cd352](https://github.com/ngneat/bind-query-params/commit/83cd352df74e6ea40497eff1d75d4afab9a34541))

## [2.0.0](https://github.com/ngneat/bind-query-params/compare/v1.7.0...v2.0.0) (2021-10-05)


### ⚠ BREAKING CHANGES

* 🧨 TwoWay strategy will now listen to query param changes instead of only
syncing on init

### Features

* 🎸 add syncInitialValue option ([2aca8b4](https://github.com/ngneat/bind-query-params/commit/2aca8b4d39a4d1f32ba5f1f8bf6ab1eab5e289bd)), closes [#14](https://github.com/ngneat/bind-query-params/issues/14)

## [1.7.0](https://github.com/ngneat/bind-query-params/compare/v1.6.2...v1.7.0) (2021-09-29)


### Features

* 🎸 syncAllDefs ([45907ec](https://github.com/ngneat/bind-query-params/commit/45907ec611a2928abedf88bed8af86fde7e8520a))

### [1.6.2](https://github.com/ngneat/bind-query-params/compare/v1.6.1...v1.6.2) (2021-09-06)


### Bug Fixes

* 🐛 empty string should considerd null ([0c04286](https://github.com/ngneat/bind-query-params/commit/0c04286314c2e2592675b8795e2f8c459dd0e81d)), closes [#16](https://github.com/ngneat/bind-query-params/issues/16)

### [1.6.1](https://github.com/ngneat/bind-query-params/compare/v1.6.0...v1.6.1) (2021-09-01)


### Bug Fixes

* 🐛 support non primitive types ([357d638](https://github.com/ngneat/bind-query-params/commit/357d63875a60a801bc5f33e7b37feab01e5106bc)), closes [#15](https://github.com/ngneat/bind-query-params/issues/15)

## [1.6.0](https://github.com/ngneat/bind-query-params/compare/v1.5.2...v1.6.0) (2021-07-11)


### Features

* 🎸 add some param exists method ([9744758](https://github.com/ngneat/bind-query-params/commit/9744758c9534cfc55e10535a90736f66250a83be))

### [1.5.2](https://github.com/ngneat/bind-query-params/compare/v1.5.1...v1.5.2) (2021-05-24)


### Bug Fixes

* 🐛 fix serializer type ([00077cc](https://github.com/ngneat/bind-query-params/commit/00077cc1ea5ae89b733bec810aff496aee378c89))

### [1.5.1](https://github.com/ngneat/bind-query-params/compare/v1.5.0...v1.5.1) (2021-02-23)


### Bug Fixes

* properly handle keys with brackets ([cf2f6a9](https://github.com/ngneat/bind-query-params/commit/cf2f6a9bf6058a1cccfc50be14b8ecec274a0456))

## [1.5.0](https://github.com/ngneat/bind-query-params/compare/v1.4.0...v1.5.0) (2021-02-14)


### Features

* add serializer option ([165d36c](https://github.com/ngneat/bind-query-params/commit/165d36c508bfc4d08b31af7595f0ce54a3bbbd16))

## [1.4.0](https://github.com/ngneat/bind-query-params/compare/v1.3.0...v1.4.0) (2021-02-14)


### Features

* 🎸 add paramExists method ([ba3c105](https://github.com/ngneat/bind-query-params/commit/ba3c105b0ca512b2e7566d7c72cce38e0abd940c))

## [1.3.0](https://github.com/ngneat/bind-query-params/compare/v1.2.0...v1.3.0) (2021-01-18)


### Features

* 🎸 release ([f4d5bb9](https://github.com/ngneat/bind-query-params/commit/f4d5bb9671a258cfd1ffcc284a8ac9a523a1c496))
* 🎸 syncdefs ([ce945be](https://github.com/ngneat/bind-query-params/commit/ce945bea672fad15adcc0b47a5584976c71a6b5b))
