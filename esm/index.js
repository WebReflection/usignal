/*! (c) Andrea Giammarchi */

let batches = null;
export const batch = fn => {
  let prev = batches;
  batches = new Set;
  fn();
  for (const fn of batches)
    prev ? prev.add(fn) : fn();
  batches = prev;
};

let effects = null;
export const effect = fn => {
  const prev = effects;
  effects = fn;
  fn();
  effects = prev;
};

const signals = new WeakMap;
export const signal = value => {
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

export const computed = value => ({
  valueOf,
  toString: valueOf,
  get value() {
    return value();
  }
});

function valueOf() {
  return this.value;
}
