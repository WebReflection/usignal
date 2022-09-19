export * from '../index.js';
import {computed as c, signal as s, Signal as S, Signal} from '../index.js';

const {setPrototypeOf} = Object;
const {prototype} = Signal;

/**
 * Returns a callback that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @param {() => T} callback a function that can computes and return any value
 * @returns {() => T}
 */
export const computed = callback => {
  const _ = c(callback);
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
 * @returns {(value?: T) => T}
 */
export const signal = value => {
  const _ = s(value);
  return setPrototypeOf(
    function (value) {
      return arguments.length ? (_.value = value) : _.value;
    },
    prototype
  );
};
