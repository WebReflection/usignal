import {computed, effect, signal} from '../index.js';

const asValue = value => typeof value === 'function' ? value() : value;

/**
 * https://www.solidjs.com/docs/latest/api#createeffect
 *
 * returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { async?: boolean }) => () => void}
 */
export const createEffect = effect;

/**
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => () => T}
 */
export const createMemo = (fn, value, options) => {
  const _ = computed(fn, value, options);
  return () => _.value;
};

/**
 * @template T
 * @type {<T>(initialValue: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => [get: () => T, set: (v: T) => T]}
 */
export const createSignal = (initialValue, options) => {
  const _ = signal(asValue(initialValue), options);
  return [
    () => _.value,
    value => {
      _.value = asValue(value);
    }
  ];
};
