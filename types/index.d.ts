export function batch(callback: () => void): void;
/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
export class Signal<T> {
    constructor(value: any);
    _: any;
    /** @returns {T} */
    toJSON(): T;
    /** @returns {string} */
    toString(): string;
    /** @returns {T} */
    valueOf(): T;
}
/**
 * Returns a read-only Signal that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @type {<R, V, T = unknown extends V ? R : R|V>(fn: (v: T) => R, value?: V, options?: { equals?: Equals<T> }) => ComputedSignal<T>}
 */
export const computed: <R, V, T = unknown extends V ? R : R | V>(fn: (v: T) => R, value?: V, options?: {
    equals?: Equals<T>;
}) => ComputedSignal<T>;
export class FX extends Computed<any> {
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
 * @type {<T>(initialValue: T, options?: { equals?: Equals<T> }) => ReactiveSignal<T>}
 */
export const signal: <T>(initialValue: T, options?: {
    equals?: Equals<T>;
}) => ReactiveSignal<T>;
export type Equals<T = any> = boolean | ((prev: T, next: T) => boolean);
/**
 * <T>
 */
export type ReactiveSignal<T> = Omit<Reactive<T>, '_' | 's' | 'c'>;
/**
 * <T>
 */
export type ComputedSignal<T> = Omit<Computed<T>, '$' | 's' | 'f' | 'r' | '_'>;
/**
 * @template T
 * @extends {Signal<T>}
 */
declare class Computed<T> extends Signal<T> {
    /**
     * @param {(v: T) => T} _
     * @param {T} v
     * @param {{ equals?: Equals<T> }} o
     * @param {boolean} f
     */
    constructor(_: (v: T) => T, v: T, o: {
        equals?: Equals<T>;
    }, f: boolean);
    /**
     * @private
     * @type{Reactive<T>}
     */
    private s;
    f: boolean;
    $: boolean;
    r: Set<any>;
    peek(): T;
    get value(): T;
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
    set value(arg: T);
    /** @returns {T} */
    get value(): T;
}
export {};
