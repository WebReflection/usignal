export function batch(callback: () => void): void;
/**
 * A reactive signal with a value property exposed also via toString and valueOf.
 * @template T
 */
export class Signal<T> {
    /** @param {T} value the value carried along the signal. */
    constructor(value: T);
    /** @private */
    private _;
    /** @returns {T} */
    toJSON(): T;
    /** @returns {T} */
    toString(): T;
    /** @returns {T} */
    valueOf(): T;
}
export function computed<T>(callback: () => T): {
    value: T;
};
export function effect(callback: () => void, aSync?: boolean): () => void;
export function signal<T>(value: T): {
    value: T;
};
