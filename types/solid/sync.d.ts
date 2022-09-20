export * from "./index.d.ts";
/**
 * synchronous https://www.solidjs.com/docs/latest/api#createeffect
 *
 * returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
export const createEffect: <T>(fn: (v?: T) => T, value?: T) => () => void;
