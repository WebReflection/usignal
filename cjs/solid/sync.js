'use strict';
(m => Object.keys(m).map(k => k !== 'default' && (exports[k] = m[k])))
(require('./index.js'));
const {effect} = require('../index.js');

/**
 * synchronous https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T) => void}
 */
 const createEffect = (callback, initialValue) => {
  effect(
    () => {
      initialValue = callback(initialValue);
    },
    false
  );
};
exports.createEffect = createEffect;
