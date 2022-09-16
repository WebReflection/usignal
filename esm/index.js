/*! (c) Andrea Giammarchi */

const COMPUTED = 0;
const EFFECT = 1;

const {is} = Object;

let batches;

/**
 * Execute a callback that will not side-effect until its top-most batch is
 * completed.
 * @param {() => void} callback a function that batches changes to be notified
 *  through signals.
 */
export const batch = callback => {
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

/**
 * A signal with a value property also exposed via toJSON, toString and valueOf.
 * When created via computed, the `value` property is **readonly**.
 * @template T
 */
export class Signal {
  /** @param {T} value the value carried along the signal. */
  constructor(value) {
    this._ = value;
  }

  /** @returns {T} */
  toJSON() { return this.value }

  /** @returns {T} */
  toString() { return this.value }

  /** @returns {T} */
  valueOf() { return this.value }
}

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
        if (computed.b === EFFECT) {
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

let reactiveSignals;
class Computed extends Signal {
  constructor(_, b) {
    super(_);
    this.b = b;       // brand
    this.$ = false;   // should update ("value for money")
    this.s = null;    // signal
  }
  /** @readonly */
  get value() {
    if (!this.s) {
      const prev = reactiveSignals;
      reactiveSignals = new Set;
      try {
        this.s = new Reactive(this._());
        if (this.b === EFFECT)
          this.r = reactiveSignals;
        for (const reactive of reactiveSignals)
          reactive.c.add(this);
      }
      finally { reactiveSignals = prev }
    }
    else if (this.$) {
      try { this.s.value = this._() }
      finally { this.$ = false }
    }
    return this.s.value;
  }
}

/**
 * Returns a read-only Signal that is invoked only when any of the internally
 * used signals, as in within the callback, is unknown or updated.
 * @template T
 * @param {() => T} callback a function that can computes and return any value
 * @returns {Signal<T>}
 */
export const computed = callback => new Computed(callback, COMPUTED);

let outerEffect;
const noop = () => {};
const stop = e => {
  for (const effect of e)
    effect.stop();
};
class Effect extends Computed {
  constructor(_, a) {
    super(_, EFFECT).r = null;  // related signals
    this.i = 0;   // index
    this.a = a;   // async
    this.m = a;   // microtask
    this.e = [];  // effects
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
    outerEffect = prev;
    // if effects are present in loops, these can grow or shrink.
    // when these grow, there's nothing to do, as well as when these are
    // still part of the loop, as the callback gets updated anyway.
    // however, if there were more effects before but none now, those can
    // just stop being referenced and go with the GC.
    if (this.i < length)
      stop(this.e.splice(this.i));
    for (const effect of this.e)
      effect.value;
  }
  stop() {
    if (this.r) {
      for (const reactive of this.r)
        reactive.c.delete(this);
      this.r.clear();
      this.r = null;
    }
    if (this.s)
      this.s.c.clear();
    this._ = noop;
    if (this.e.length)
      stop(this.e.splice(0));
  }
}

/**
 * Invokes a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @param {boolean} [aSync=false] specify an asynchronous effect instead
 * @returns {() => void} a callback to stop/dispose the effect
 */
export const effect = (callback, aSync = false) => {
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
      e[i] = new Effect(callback, aSync);
    unique = e[i];
    outerEffect.i++;
  }
  else
    (unique = new Effect(callback, aSync)).value;
  return () => { unique.stop() };
};

class Reactive extends Signal {
  constructor(_) {
    super(_).c = new Set; // computeds
  }
  peek() { return this._ }
  get value() {
    if (reactiveSignals)
      reactiveSignals.add(this);
    return this._;
  }
  set value(_) {
    if (!is(_, this._)) {
      this._ = _;
      compute(this);
    }
  }
}

/**
 * Returns a writable Signal that side-effects whenever its value gets updated.
 * @template T
 * @param {T} value the value the Signal should carry along
 * @returns {Signal<T>}
 */
export const signal = value => new Reactive(value);
