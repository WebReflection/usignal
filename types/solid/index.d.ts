/**
 * https://www.solidjs.com/docs/latest/api#createeffect
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { async?: boolean, untrack?: boolean }) => void}
 */
export const createEffect: <T_1>(fn: (v: T_1) => T_1, value?: T_1, options?: {
    async?: boolean;
    untrack?: boolean;
}) => void;
/**
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean), untrack?: boolean }) => () => T}
 */
export const createMemo: <T_1>(fn: (v: T_1) => T_1, value?: T_1, options?: {
    equals?: boolean | ((prev: T_1, next: T_1) => boolean);
    untrack?: boolean;
}) => () => T_1;
/**
 * @template T
 * @type {<T>(initialValue: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => [get: () => T, set: (v: T) => T]}
 */
export const createSignal: <T_1>(initialValue: T_1, options?: {
    equals?: boolean | ((prev: T_1, next: T_1) => boolean);
}) => [get: () => T_1, set: (v: T_1) => T_1];
