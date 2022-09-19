export * from "./index.js";
/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 *
 * Returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
export const effect: <T>(fn: (v?: T) => T, value?: T) => () => void;
