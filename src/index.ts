import { match, Path } from "path-to-regexp";

/**
 * Internal URL cache to avoid `new URL` calls every execution.
 */
export const urlKey = Symbol("url");

/**
 * Internal pathname cache to support mounting of routes.
 */
export const pathKey = Symbol("path");

/**
 * Internal method cache to avoid `.toLowerCase()` checks every execution.
 */
export const methodKey = Symbol("method");

/**
 * Add `params` to the request object.
 */
export const paramsKey = Symbol("params");

/**
 * Valid input function type.
 */
export type Fn<T extends Request, U extends Response> = (
  req: T,
  done: () => Promise<U>
) => U | Promise<U>;

/**
 * Allowed `path-to-regexp` options.
 */
export type Options = Partial<
  Record<"end" | "start" | "strict" | "sensitive", boolean>
>;

/**
 * Method parameters provided by `fetch-router`.
 */
export interface MethodParams {
  [methodKey]: string;
}

/**
 * Path parameters provided by `fetch-router`.
 */
export interface PathParams<T extends object> {
  [urlKey]: URL;
  [pathKey]: string;
  [paramsKey]: T;
}

/**
 * The `path` function matches request paths against `path-to-regexp`.
 */
export function use<
  P extends object = {},
  T extends Request = Request,
  U extends Response = Response
>(path: Path, fn: Fn<T & PathParams<P>, U>, options?: Options) {
  const check = match<P>(path, {
    encode: encodeURI,
    decode: decodeURIComponent,
    ...options,
  });

  return async function pathMiddleware(
    req: T & Partial<PathParams<{}>>,
    next: () => Promise<U>
  ) {
    const url = req[urlKey] || new URL(req.url, "http://localhost");
    const path = req[pathKey] || url.pathname;
    const m = check(path);
    if (!m) return next();

    return fn(
      Object.assign(req, {
        // Allow nesting of paths automatically.
        [pathKey]: path.slice(0, m.index) + path.slice(m.index + m.path.length),
        // Expose original `URL` object.
        [urlKey]: url,
        // Allow `params` to be accessed.
        [paramsKey]: m.params,
      }),
      next
    );
  };
}

/**
 * Match requests against a method.
 */
export function method<
  T extends Request = Request,
  U extends Response = Response
>(method: string, fn: Fn<T & MethodParams, U>) {
  const verb = method.toUpperCase();

  return async function methodMiddleware(
    req: T & Partial<MethodParams>,
    next: () => Promise<U>
  ) {
    const method = req[methodKey] || req.method.toUpperCase();
    if (method !== verb) return next();
    return fn(Object.assign(req, { [methodKey]: method }), next);
  };
}

/**
 * Support shorthand path methods.
 */
export function create(verb: string) {
  return function pathWithMethod<
    P extends object = {},
    T extends Request = Request,
    U extends Response = Response
  >(str: Path, fn: Fn<T & MethodParams & PathParams<P>, U>, options?: Options) {
    return use<P, T, U>(str, method(verb, fn), options);
  };
}

/**
 * Declare common methods.
 */
export const get = create("GET");
export const head = create("HEAD");
export const put = create("PUT");
export const post = create("POST");
export const patch = create("PATCH");
export const del = create("DELETE");
export const options = create("OPTIONS");
