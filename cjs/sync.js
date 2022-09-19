'use strict';
(m => Object.keys(m).map(k => k !== 'default' && (exports[k] = m[k])))
(require('./index.js'));
const {effect: fx} = require('./index.js');

const options = {async: false};

/**
 * Invokes synchronously a function when any of its internal signals or computed values change.
 *
 * Returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v?: T) => T?, value?: T) => () => void 0}
 */
const effect = (fn, value) => fx(fn, value, options);
exports.effect = effect;
