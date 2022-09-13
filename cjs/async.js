'use strict';
const {signal, computed, effect: fx, batch, Signal} = require('./index.js');

/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 * @param {function} callback the function to asynchronously re-invoke on changes.
 */
const effect = callback => fx(callback, true);

exports.signal = signal;
exports.computed = computed;
exports.effect = effect;
exports.batch = batch;
exports.Signal = Signal;

