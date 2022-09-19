export * from './index.js';
import {effect} from '../index.js';

/**
 * synchronous https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T) => void}
 */
 export const createEffect = (callback, initialValue) => {
  effect(
    () => {
      initialValue = callback(initialValue);
    },
    false
  );
};
