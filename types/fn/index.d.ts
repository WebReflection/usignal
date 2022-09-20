export * from "../index.d.ts";
/**
 * Returns a callback that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => () => T}
 */
export const computed: <T>(fn: (v: T) => T, value?: T, options?: {
    equals?: boolean | ((prev: T, next: T) => boolean);
}) => () => T;
export function signal<T>(value: T, options?: {
    equals?: boolean | ((prev: T, next: T) => boolean);
}): (value?: T) => T;
