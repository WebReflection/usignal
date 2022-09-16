export * from './index.js';
import {effect as fx} from './index.js';

/**
 * Invokes synchronously a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @returns {() => void} a callback to stop/dispose the effect
 */
const effect = callback => fx(callback, false);
export {effect};
