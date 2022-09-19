'use strict';
const {computed, effect, signal} = require('../index.js');

const asValue = value => typeof value === 'function' ? value() : value;
/**
 * https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, aSync?: boolean) => void}
 */
const createEffect = (callback, initialValue, async = false) => {
  effect(
    () => {
      initialValue = callback(initialValue);
    },
    async
  );
};
exports.createEffect = createEffect;

/**
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T) => () => T}
 */
const createMemo = (callback, initialValue) => {
  const _ = computed(() => (initialValue = callback(initialValue)));
  return () => _.value;
};
exports.createMemo = createMemo;

/**
 * @template T
 * @type {<T>(initialValue: T) => [get: () => T, set: (v: T) => T]}
 */
const createSignal = value => {
  const _ = signal(asValue(value));
  return [
    () => _.value,
    value => {
      _.value = asValue(value);
    }
  ];
};
exports.createSignal = createSignal;
