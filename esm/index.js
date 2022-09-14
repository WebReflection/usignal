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
      /* c8 ignore start */
      else c.delete(ref);
      /* c8 ignore stop */
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
    this.$ = false;   // $ should update
    this.s = void 0;  // signal
  }
  /** @readonly */
  get value() {
    if (!this.s) {
      const prev = computeds;
      computeds = new Set;
      try {
        this.s = new Reactive(this._());
        const wr = new WeakRef(this);
        for (const signal of computeds)
          signal.c.add(wr);
      }
      finally { computeds = prev }
    }
    if (this.$) {
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
class Effect extends Computed {
  constructor(_, a) {
    super(_);
    this.i = 0;   // index
    this.a = a;   // async
    this.m = a;   // microtask
    this.e = [];  // effects
                  // I am effects ^_^;;
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
    (outer = this).i = 0;
    super.value;
    outer = prev;
  }
}

/**
 * Invokes a function when any of its internal signals or computed values change.
 * @param {() => void} callback the function to re-invoke on changes.
 * @param {boolean} [aSync=false] specify an asynchronous effect instead
 */
export const effect = (callback, aSync = false) => {
  if (outer) {
    const {i, e} = outer;
    const unique = e[i] || (e[i] = new Effect(callback, aSync));
    outer.i++;
    unique.value;
  }
  else
    new Effect(callback, aSync).value;
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
