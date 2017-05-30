# tscodeshift

[![GitHub license][license-image]][license-link]
[![npm][npm-image]][npm-link]
[![Travis][ci-image]][ci-link]
[![Coverage Status][coverage-image]][coverage-link]
[![Commitizen friendly][commitizen-image]][commitizen-link]
[![Standard Version][standard-version-image]][standard-version-link]
[![Greenkeeper badge](https://badges.greenkeeper.io/KnisterPeter/tscodeshift.svg)](https://greenkeeper.io/)

tscodeshift is a toolkit for running codemods over multiple TS files.
It borrows its ideas from [jscodeshift](https://github.com/facebook/jscodeshift) in a shameless manner.

## Usage

```
  Usage: tscodeshift <path>... [options]

  path     Files or directory to transform

  Options:
    -t FILE, --transform FILE   Path to the transform file. Can be either a local path or url  [./transform.js]
```


[license-image]: https://img.shields.io/github/license/KnisterPeter/tscodeshift.svg
[license-link]: https://github.com/KnisterPeter/tscodeshift
[npm-image]: https://img.shields.io/npm/v/tscodeshift.svg
[npm-link]: https://www.npmjs.com/package/tscodeshift
[ci-image]: https://img.shields.io/travis/KnisterPeter/tscodeshift.svg
[ci-link]: https://travis-ci.org/KnisterPeter/tscodeshift
[coverage-image]: https://coveralls.io/repos/github/KnisterPeter/tscodeshift/badge.svg?branch=master
[coverage-link]: https://coveralls.io/github/KnisterPeter/tscodeshift?branch=master
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-link]: http://commitizen.github.io/cz-cli/
[standard-version-image]: https://img.shields.io/badge/release-standard%20version-brightgreen.svg
[standard-version-link]: https://github.com/conventional-changelog/standard-version
