'use strict';
(m => Object.keys(m).map(k => k !== 'default' && (exports[k] = m[k])))
(require('./index.js'));
const {createEffect: fx} = require('./index.js');

const options = {async: true};

/**
 * asynchronous https://www.solidjs.com/docs/latest/api#createeffect
 * 
 * returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
 const createEffect = (fn, initialValue) => fx(fn, initialValue, options);
exports.createEffect = createEffect;