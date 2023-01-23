'use strict';
/*! (c) Andrea Giammarchi */

const {is} = Object;

let batches;

/**
 * Execute a callback that will not side-effect until its top-most batch is
 * completed.
 * @param {() => void} callback a function that batches changes to be notified
 *  through signals.
 */
const batch = callback => {
  const prev = batches;
  batches = prev || [];
  try {
    callback();
    if (!prev)
      for (const {value} of batches);
  }
  finally { batches = prev }
};
exports.batch = batch;

/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
class Signal {
  /** @param {T} value the value carried along the signal. */
  constructor(value) {
    this._ = value;
  }

  /** @param {function} resolve */
  then(resolve) { resolve(this.value) }

  /** @returns {T} */
  toJSON() { return this.value }

  /** @returns {T} */
  toString() { return this.value }

  /** @returns {T} */
  valueOf() { return this.value }
}
exports.Signal = Signal

let computedSignal;
class Computed extends Signal {
  constructor(_, v, o, f) {
    super(_);
    this.f = f;                   // is effect?
    this.$ = true;                // should update ("value for money")
    this.r = new Set;             // related signals
    this.s = new Reactive(v, o);  // signal
  }
  /** @readonly */
  get value() {
    if (this.$) {
      const prev = computedSignal;
      computedSignal = this;
      try { this.s.value = this._(this.s._) }
      finally {
        this.$ = false;
        computedSignal = prev;
      }
    }
    return this.s.value;
  }
}

const defaults = {async: false, equals: true};

/**
 * Returns a read-only Signal that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => Signal<T>}
 */
const computed = (fn, value, options = defaults) =>
                          new Computed(fn, value, options, false);
exports.computed = computed;

let outerEffect;
const empty = [];
const noop = () => {};
const dispose = ({s}) => {
  if (typeof s._ === 'function')
    s._ = s._();
};

class FX extends Computed {
  constructor(_, v, o) {
    super(_, v, o, true);
    this.e = empty;
  }
  run() {
    this.$ = true;
    this.value;
    return this;
  }
  stop() {
    this._ = noop;
    this.r.clear();
    this.s.c.clear();
  }
}
exports.FX = FX

class Effect extends FX {
  constructor(_, v, o) {
    super(_, v, o);
    this.i = 0;         // index
    this.a = !!o.async; // async
    this.m = true;      // microtask
    this.e = [];        // effects
                        // "I am effects" ^_^;;
  }
  get value() {
    this.a ? this.async() : this.sync();
  }
  async() {
    if (this.m) {
      this.m = false;
      queueMicrotask(() => {
        this.m = true;
        this.sync();
      });
    }
  }
  sync() {
    const prev = outerEffect;
    (outerEffect = this).i = 0;
    dispose(this);
    super.value;
    outerEffect = prev;
  }
  stop() {
    super.stop();
    dispose(this);
    for (const effect of this.e.splice(0))
      effect.stop();
  }
}
exports.Effect = Effect

/**
 * Invokes a function when any of its internal signals or computed values change.
 * 
 * Returns a dispose callback.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { async?: boolean }) => () => void}
 */
const effect = (callback, value, options = defaults) => {
  let unique;
  if (outerEffect) {
    const {i, e} = outerEffect;
    const isNew = i === e.length;
    // bottleneck:
    // there's literally no way to optimize this path *unless* the callback is
    // already a known one. however, latter case is not really common code so
    // the question is: should I optimize this more than this? 'cause I don't
    // think the amount of code needed to understand if a callback is *likely*
    // the same as before makes any sense + correctness would be trashed.
    if (isNew || e[i]._ !== callback) {
      if (!isNew) e[i].stop();
      e[i] = new Effect(callback, value, options).run();
    }
    unique = e[i];
    outerEffect.i++;
  }
  else
    unique = new Effect(callback, value, options).run();
  return () => { unique.stop() };
};
exports.effect = effect;

const skip = () => false;
class Reactive extends Signal {
  constructor(_, {equals}) {
    super(_)
    this.c = new Set;                                 // computeds
    this.s = equals === true ? is : (equals || skip); // (don't) skip updates
  }
  peek() { return this._ }
  get value() {
    if (computedSignal) {
      this.c.add(computedSignal);
      computedSignal.r.add(this);
    }
    return this._;
  }
  set value(_) {
    const prev = this._;
    if (!this.s((this._ = _), prev)) {
      if (this.c.size) {
        const effects = [];
        const stack = [this];
        for (const signal of stack) {
          for (const computed of signal.c) {
            if (!computed.$ && computed.r.has(signal)) {
              computed.r.clear();
              computed.$ = true;
              if (computed.f) {
                effects.push(computed);
                const stack = [computed];
                for (const c of stack) {
                  for (const effect of c.e) {
                    effect.r.clear();
                    effect.$ = true;
                    stack.push(effect);
                  }
                }
              }
              else
                stack.push(computed.s);
            }
          }
        }
        for (const effect of effects)
          batches ? batches.push(effect) : effect.value;
      }
    }
  }
}

/**
 * Returns a writable Signal that side-effects whenever its value gets updated.
 * @template T
 * @type {<T>(initialValue: T, options?: { equals?: boolean | ((prev: T, next: T) => boolean) }) => Signal<T>}
 */
const signal = (value, options = defaults) => new Reactive(value, options);
exports.signal = signal;
