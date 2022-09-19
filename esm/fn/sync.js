export * from './index.js';
import {effect as fx} from '../index.js';

const options = {async: false};

/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 *
 * Returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
export const effect = (fn, value) => fx(fn, value, options);
