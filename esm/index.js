/*! (c) Andrea Giammarchi */

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
 * A reactive signal with a value property exposed also via toString and valueOf.
 */
export class Signal {
  /** @param {T} value the value carried along the signal. */
  constructor(value) {
    /** @private */
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
    effects = prev || new Set;
    for (const ref of c) {
      const computed = ref.deref();
      if (computed) {
        // it should never be needed to enforce twice
        if (!computed.$) {
          computed.$ = true;
          if (computed instanceof Effect) {
            effects.add(computed);
            update(computed);
          }
          else
            compute(computed.s);
        }
      }
      else c.delete(ref);
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

let computeds;
class Computed extends Signal {
  constructor(_) {
    super(_);
    this.$ = false;   // $ should update ("value for money")
    this.s = void 0;  // signal
  }
  /** @readonly */
  get value() {
    if (!this.s) {
      const prev = computeds;
      computeds = new Set;
      try {
        this.s = new Reactive(this._());
        // why WeakRef? well, a computed/effect can depend on signals but
        // rarely vice-versa (if ever). When a computed/effect is gone the
        // signal should be able to drop it too to avoid memory leaks.
        // The dropping ref part though happens on signal change only but
        // if a singal is GC collected, all its computed/effects can go too.
        const wr = new WeakRef(this);
        for (const signal of computeds)
          signal.c.add(wr);
      }
      finally { computeds = prev }
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
 * @param {() => T} callback a function that can computes and return any value
 * @returns {{value: readonly T}}
 */
export const computed = callback => new Computed(callback);

let outer;
const noop = () => {};
const stop = e => {
  for (const effect of e)
    effect.stop();
};
class Effect extends Computed {
  constructor(_, a) {
    super(_);
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
    const prev = outer;
    const {e} = this;
    (outer = this).i = 0;
    const {length} = e;
    super.value;
    // if effects are present in loops, these can grow or shrink.
    // when these grow, there's nothing to do, as well as when these are
    // still part of the loop, as the callback gets updated anyway.
    // however, if there were more effects before but none now, those can
    // just stop being referenced and go with the GC.
    if (outer.i < length)
      stop(e.splice(outer.i));
    for (const effect of e)
      effect.value;
    outer = prev;
  }
  stop() {
    this._ = this.sync = this.async = noop;
    if (this.e.length)
      stop(this.e.splice(0));
  }
}

/**
 * Invokes a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @param {boolean} [aSync=false] specify an asynchronous effect instead
 * @returns {function} a callback to stop/dispose the effect
 */
export const effect = (callback, aSync = false) => {
  let unique;
  if (outer) {
    const {i, e} = outer;
    // bottleneck #2 (first being new WeakRef and deref() dance possibly slow)
    // there's literally no way to optimize this path *unless* the callback is
    // already a known one. however, latter case is not really common code so
    // the question is: should I optimize this more than this? 'cause I don't
    // think the amount of code needed to understand if a callback is *likely*
    // the same as before makes any sense + correctness would be trashed.
    if (i === e.length || e[i]._ !== callback)
      e[i] = new Effect(callback, aSync);
    unique = e[i];
    outer.i++;
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
    if (computeds)
      computeds.add(this);
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
 * @param {T} value the value the Signal should carry along
 * @returns {{value: T}}
 */
export const signal = value => new Reactive(value);
