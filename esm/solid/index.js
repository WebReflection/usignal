import {computed, effect, signal} from '../index.js';

const asValue = value => typeof value === 'function' ? value() : value;
/**
 * https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, aSync?: boolean) => void}
 */
export const createEffect = (callback, initialValue, async = false) => {
  effect(
    () => {
      initialValue = callback(initialValue);
    },
    async
  );
};

/**
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T) => () => T}
 */
export const createMemo = (callback, initialValue) => {
  const _ = computed(() => (initialValue = callback(initialValue)));
  return () => _.value;
};

/**
 * @template T
 * @type {<T>(initialValue: T) => [get: () => T, set: (v: T) => T]}
 */
export const createSignal = value => {
  const _ = signal(asValue(value));
  return [
    () => _.value,
    value => {
      _.value = asValue(value);
    }
  ];
};
