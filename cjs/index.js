'use strict';
/*! (c) Andrea Giammarchi */

const {is} = Object;

let batches;

/**
 * Execute a callback that will not side-effect until its top-most batch is
 * completed.
 * @param {function} callback a function that batches changes to be notified
 *  through signals.
 */
const batch = callback => {
  const prev = batches;
  batches = prev || [];
  try {
    callback();
    if (!prev) for (const fn of batches) fn();
  }
  finally { batches = prev }
};
exports.batch = batch;

class Signal {
  constructor(_) { this._ = _ }
  toString() { return this.value }
  valueOf() { return this.value }
}
exports.Signal = Signal

const update = ({o:{$}}) => {
  for (const effect of $) {
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
        computed.$ = true;
        if (computed instanceof Effect) {
          effects.add(computed);
          update(computed);
        }
        else
          compute(computed.s);
      }
      /* c8 ignore start */
      else c.delete(ref);
      /* c8 ignore end */
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
    this.$ = false;
    this.s = void 0;
  }
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
 * @param {function} callback a function that can computes and return any value
 * @returns {Signal}
 */
const computed = callback => new Computed(callback);
exports.computed = computed;

let outer;
class Effect extends Computed {
  constructor(_) {
    super(_).o = {i: 0, $: []};
  }
  get value() {
    const prev = outer;
    outer = this.o;
    outer.i = 0;
    super.value;
    outer = prev;
  }
}

const effect = callback => {
  if (outer) {
    const {i, $} = outer;
    const unique = $[i] || ($[i] = new Effect(callback));
    outer.i++;
    unique.value;
  }
  else
    new Effect(callback).value;
};
exports.effect = effect;

class Reactive extends Signal {
  constructor(_) {
    super(_).c = new Set;
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
 * @param {any} value the value the Signal should carry along
 * @returns {Signal}
 */
const signal = value => new Reactive(value);
exports.signal = signal;
