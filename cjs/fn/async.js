'use strict';
(m => Object.keys(m).map(k => k !== 'default' && (exports[k] = m[k])))
(require('./index.js'));
const {effect: fx} = require('../index.js');

/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @returns {() => void} a callback to stop/dispose the effect
 */
const effect = callback => fx(callback, true);
exports.effect = effect;
