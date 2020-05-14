# Fetch Router

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Simple routing middleware for [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Installation

```sh
npm install @borderless/fetch-router --save
```

## Usage

```js
import { compose } from "throwback";
import { get, post, paramsKey } from "@borderless/fetch-router";

const animals = ["rabbit", "dog", "cat"];

const app = compose([
  get("/pets", function () {
    return new Response(animals.join("\n"));
  }),
  get("/pets/:id", function (req) {
    return new Response(animals[Number(req[paramsKey].id)]);
  }),
]);
```

### Composition

If you need more control, the package exposes the internally used functions: `method` and `use`.

- `use(path, fn, options?)` - Match an incoming request against [Path To RegExp](https://github.com/pillarjs/path-to-regexp).
- `method(verb, fn)` - Match an incoming request against a HTTP method.

**Tip:** You can recursively mount routes using `use()` and `{ end: false }`:

```js
const nested = get("/pets", () => new Response("test"));
const app = use("/api", nested, { end: false }); // Allows partial match on `/api/pets`.
```

## TypeScript

This project is written using [TypeScript](https://github.com/Microsoft/TypeScript) and publishes the definitions directly to NPM.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@borderless/fetch-router.svg?style=flat
[npm-url]: https://npmjs.org/package/@borderless/fetch-router
[downloads-image]: https://img.shields.io/npm/dm/@borderless/fetch-router.svg?style=flat
[downloads-url]: https://npmjs.org/package/@borderless/fetch-router
[travis-image]: https://img.shields.io/travis/BorderlessLabs/fetch-router.svg?style=flat
[travis-url]: https://travis-ci.org/BorderlessLabs/fetch-router
[coveralls-image]: https://img.shields.io/coveralls/BorderlessLabs/fetch-router.svg?style=flat
[coveralls-url]: https://coveralls.io/r/BorderlessLabs/fetch-router?branch=master
