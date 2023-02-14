export function batch(callback: () => void): void;
/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
export class Signal<T> {
    /** @param {T} value the value carried along the signal. */
    constructor(value: T);
    /**
     * @private
     * @type {T}
     */
    private _;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2>;
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
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: Equals }) => Signal<T>}
 */
export const computed: <T>(fn: (v: T) => T, value?: T, options?: {
    equals?: Equals;
}) => Signal<T>;
export class FX extends Computed {
    constructor(_: any, v: any, o: any);
    e: any[];
    run(): FX;
    stop(): void;
}
export class Effect extends FX {
    i: number;
    a: boolean;
    m: boolean;
    get value(): void;
    async(): void;
    sync(): void;
}
/**
 * Invokes a function when any of its internal signals or computed values change.
 *
 * Returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { async?: boolean }) => () => void}
 */
export const effect: <T>(fn: (v: T) => T, value?: T, options?: {
    async?: boolean;
}) => () => void;
/**
 * Returns a writable Signal that side-effects whenever its value gets updated.
 * @template T
 * @type {<T>(initialValue: T, options?: { equals?: Equals }) => Signal<T> & Pick<Reactive<T>, 'peek'>}
 */
export const signal: <T>(initialValue: T, options?: {
    equals?: Equals;
}) => Signal<T> & Pick<Reactive<T>, "peek">;
export type Equals = boolean | ((prev: T, next: T) => boolean);
declare class Computed extends Signal<any> {
    constructor(_: any, v: any, o: any, f: any);
    f: any;
    $: boolean;
    r: Set<any>;
    s: Reactive<any>;
    /** @readonly */
    readonly get value(): any;
}
/**
 * @template T
 * @extends {Signal<T>}
 */
declare class Reactive<T> extends Signal<T> {
    constructor(_: any, { equals }: {
        equals: any;
    });
    c: Set<any>;
    s: any;
    /**
     * Allows to get signal.value without subscribing to updates in an effect
     * @returns {T}
     */
    peek(): T;
    set value(arg: any);
    get value(): any;
    _: any;
}
export {};
