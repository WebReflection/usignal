export * from "./index.js";
/**
 * Invokes asynchronously a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @returns {() => void} a callback to stop/dispose the effect
 */
export function effect(callback: () => void): () => void;
