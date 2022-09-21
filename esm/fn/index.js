export * from '../index.js';
import {computed as c, signal as s, Signal as S, Signal} from '../index.js';

const {setPrototypeOf} = Object;
const {prototype} = Signal;

/**
 * Returns a callback that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean), untrack?: boolean }) => () => T}
 */
export const computed = (fn, value, options) => {
  const _ = c(fn, value, options);
  return setPrototypeOf(
    () => _.value,
    prototype
  );
};

/**
 * Returns a callback that executed with no argument returns the signal value,
 * otherwise it updates the signal value and returns its new value.
 * @template T
 * @param {T} value the value the Signal should carry along
 * @param {{equals?: boolean | ((prev: T, next: T) => boolean)}} [options] signal options
 * @returns {(value?: T) => T}
 */
export const signal = (value, options) => {
  const _ = s(value, options);
  return setPrototypeOf(
    function (value) {
      return arguments.length ? (_.value = value) : _.value;
    },
    prototype
  );
};
