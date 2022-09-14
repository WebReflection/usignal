export function batch(callback: () => void): void;
/**
 * A reactive signal with a value property exposed also via toString and valueOf.
 */
export class Signal {
    /** @param {T} value the value carried along the signal. */
    constructor(value: T);
    /** @private */
    private _;
    /** @returns {T} */
    toString(): T;
    /** @returns {T} */
    valueOf(): T;
}
export function computed(callback: () => T): {
    value: readonly T;
};
export function effect(callback: () => void, aSync?: boolean): void;
export function signal(value: T): {
    value: T;
};
