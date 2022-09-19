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
      for (const callback of batches)
        callback();
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

  /** @returns {T} */
  then() { return this.value }

  /** @returns {T} */
  toJSON() { return this.value }

  /** @returns {T} */
  toString() { return this.value }

  /** @returns {T} */
  valueOf() { return this.value }
}
exports.Signal = Signal

const update = ({e}) => {
  for (const effect of e) {
    effect.$ = true;
    update(effect);
  }
};

let effects;
const compute = ({c}) => {
  if (c.size) {
    const prev = effects;
    effects = prev || [];
    for (const computed of c) {
      if (!computed.$) {
        computed.$ = true;
        if (computed.f) {
          effects.push(computed);
          update(computed);
        }
        else
          compute(computed.s);
      }
    }
    try {
      if (!prev) {
        for (const effect of effects)
          batches ? batches.push(() => { effect.value }) : effect.value;
      }
    }
    finally { effects = prev }
  }
};

let computedSignals;
let realtedSignals;
const clear = self => {
  for (const signal of self.r)
    signal.c.delete(self);
  self.r.clear();
};
class Computed extends Signal {
  constructor(_, v, o) {
    super(_);
    this.f = false;   // is effect?
    this.$ = false;   // should update ("value for money")
    this.s = null;    // signal
    this.r = new Set; // related signals
    this.o = o;       // options
    this.v = v;       // value to pass along
  }
  /** @readonly */
  get value() {
    const cs = computedSignals;
    const rs = realtedSignals;
    try {
      computedSignals = this;
      realtedSignals = this.r;
      if (!this.s)
        this.s = new Reactive(this._(this.v), this.v = this.o);
      else if (this.$) {
        clear(this);
        this.s.value = this._(this.s._);
      }
    }
    finally {
      this.$ = false;
      computedSignals = cs;
      realtedSignals = rs;
    }
    return this.s.value;
  }
}

const defaults = {async: false, equals: true};

/**
 * Returns a read-only Signal that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @type {<T>(fn: (v: T) => T, value?: T, options?: { equals?: false | ((prev: T, next: T) => boolean) }) => Signal<T>}
 */
const computed = (fn, value, options = defaults) =>
                          new Computed(fn, value, options);
exports.computed = computed;

let outerEffect;
const noop = () => {};
const stop = e => {
  for (const effect of e)
    effect.stop();
};
class Effect extends Computed {
  constructor(_, v, o) {
    super(_, v, o).f = true;
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
    outerEffect = this;
    this.i = 0;
    const {length} = this.e;
    super.value;
    // if effects are present in loops, these can grow or shrink.
    // when these grow, there's nothing to do, as well as when these are
    // still part of the loop, as the callback gets updated anyway.
    // however, if there were more effects before but none now, those can
    // just stop being referenced and go with the GC.
    if (this.i < length)
      stop(this.e.splice(this.i));
    for (const {value} of this.e);
    outerEffect = prev;
  }
  stop() {
    if (this.s) {
      clear(this);
      this.s.c.clear();
      this.s = this.r = null;
    }
    this._ = noop;
    if (this.e.length)
      stop(this.e.splice(0));
  }
}

/**
 * Invokes a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @param {T} [value] a value to pass along a sargument and previously returned value
 * @param {boolean} [options=false] specify an asynchronous effect instead
 * @returns {() => void} a callback to stop/dispose the effect
 */
const effect = (callback, value, options = defaults) => {
  let unique;
  if (outerEffect) {
    const {i, e} = outerEffect;
    // bottleneck:
    // there's literally no way to optimize this path *unless* the callback is
    // already a known one. however, latter case is not really common code so
    // the question is: should I optimize this more than this? 'cause I don't
    // think the amount of code needed to understand if a callback is *likely*
    // the same as before makes any sense + correctness would be trashed.
    if (i === e.length || e[i]._ !== callback)
      e[i] = new Effect(callback, value, options);
    unique = e[i];
    outerEffect.i++;
  }
  else
    (unique = new Effect(callback, value, options)).value;
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
    if (computedSignals) {
      this.c.add(computedSignals);
      realtedSignals.add(this);
    }
    return this._;
  }
  set value(_) {
    if (!this.s(this._, _)) {
      this._ = _;
      compute(this);
    }
  }
}

/**
 * Returns a writable Signal that side-effects whenever its value gets updated.
 * @template T
 * @param {T} value the value the Signal should carry along
 * @param {{equals?: false | ((prev: T, next: T) => boolean)}} [options] signal options
 * @returns {Signal<T>}
 */
const signal = (value, options = defaults) => new Reactive(value, options);
exports.signal = signal;
