/*! (c) Andrea Giammarchi */

let batches = null;
export const batch = fn => {
  const prev = batches;
  batches = new Set;
  try {
    fn();
    for (const fn of batches)
      prev ? prev.add(fn) : fn();
  }
  finally { batches = prev; }
};

let effects = null;
export const effect = fn => {
  const prev = effects;
  effects = fn;
  try { fn(); }
  finally { effects = prev; }
};

const signals = new WeakMap;
export const signal = value => {
  const out = {
    peek,
    toString: peek,
    valueOf: peek,
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
  toString: peek,
  valueOf: peek,
  get value() {
    return value();
  },
  set value(_) {
    throw new Error('computed are read-only');
  }
});

function peek() {
  return this.value;
}
