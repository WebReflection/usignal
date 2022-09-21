'use strict';
const {computed, effect, signal} = require('../index.js');

const asValue = value => typeof value === 'function' ? value() : value;

/**
 * https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { async?: boolean, untrack?: boolean }) => void}
 */
const createEffect = effect;
exports.createEffect = createEffect;

/**
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean), untrack?: boolean }) => () => T}
 */
const createMemo = (fn, value, options) => {
  const _ = computed(fn, value, options);
  return () => _.value;
};
exports.createMemo = createMemo;

/**
 * @template T
 * @type {<T>(initialValue: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => [get: () => T, set: (v: T) => T]}
 */
const createSignal = (initialValue, options) => {
  const _ = signal(asValue(initialValue), options);
  return [
    () => _.value,
    value => {
      _.value = asValue(value);
    }
  ];
};
exports.createSignal = createSignal;
