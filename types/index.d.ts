export function batch(callback: () => void): void;
/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
export class Signal<T> {
    /** @param {T} value the value carried along the signal. */
    constructor(value: T);
    value: T;
    /** @returns {T} */
    then(): T;
    /** @returns {T} */
    toJSON(): T;
    /** @returns {T} */
    toString(): T;
    /** @returns {T} */
    valueOf(): T;
}
/**
 * Returns a read-only Signal that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: false | ((prev: T, next: T) => boolean) }) => Signal<T>}
 */
export const computed: <T>(fn: (v: T) => T, value?: T, options?: {
    equals?: false | ((prev: T, next: T) => boolean);
}) => Signal<T>;
export function effect(callback: () => void, value?: T, options?: boolean): () => void;
export function signal<T>(value: T, options?: {
    equals?: false | ((prev: T, next: T) => boolean);
}): Signal<T>;
