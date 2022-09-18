export function batch(callback: () => void): void;
/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
export class Signal<T> {
    /** @param {T} value the value carried along the signal. */
    constructor(value: T);
    /** @protected */
    protected _: T;
    /** @returns {T} */
    toJSON(): T;
    /** @returns {T} */
    toString(): T;
    /** @returns {T} */
    valueOf(): T;
}
export function computed<T>(callback: () => T): Signal<T>;
export function effect(callback: () => void, aSync?: boolean): () => void;
export function signal<T>(value: T): Signal<T>;
