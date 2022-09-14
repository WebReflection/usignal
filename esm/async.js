import {signal, computed, effect as fx, batch, Signal} from './index.js';

/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 * @param {function} callback the function to asynchronously re-invoke on changes.
 */
const effect = callback => fx(callback, true);

export {signal, computed, effect, batch, Signal};
