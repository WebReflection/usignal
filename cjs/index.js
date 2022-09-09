'use strict';
/*! (c) Andrea Giammarchi */

let batches = null;
const batch = fn => {
  let prev = batches;
  batches = new Set;
  try {
    fn();
    for (const fn of batches)
      prev ? prev.add(fn) : fn();
  }
  finally { batches = prev; }
};
exports.batch = batch;

let effects = null;
const effect = fn => {
  const prev = effects;
  effects = fn;
  try { fn(); }
  finally { effects = prev; }
};
exports.effect = effect;

const signals = new WeakMap;
const signal = value => {
  const out = {
    valueOf,
    peek: valueOf,
    toString: valueOf,
    get value() {
      if (effects)
        signals.get(this).add(effects);
      return value;
    },
    set value(current) {
      value = current;
      for (const fn of signals.get(this))
        batches ? batches.add(fn) : fn();
    }
  };
  signals.set(out, new Set);
  return out;
};
exports.signal = signal;

const computed = value => ({
  valueOf,
  toString: valueOf,
  get value() {
    return value();
  },
  set value(_) {
    throw new Error('computed are read-only');
  }
});
exports.computed = computed;

function valueOf() {
  return this.value;
}
