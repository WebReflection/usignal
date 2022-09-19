export * from './index.js';
import {createEffect as fx} from './index.js';

const options = {async: true};

/**
 * asynchronous https://www.solidjs.com/docs/latest/api#createeffect
 * 
 * returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
 export const createEffect = (fn, initialValue) => fx(fn, initialValue, options);