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

class Computed {
  constructor(_) {
    this._ = _;
  }
  get value() {
    return this._();
  }
  set value(_) {
    throw new Error('computed are read-only');
  }
  toString() { return this._() }
  valueOf() { return this._() }
}

export const computed = value => new Computed(value);

class Signal {
  constructor(_) {
    this._ = _;
    this.$ = new Set;
  }
  get value() {
    if (effects)
      this.$.add(effects);
    return this._;
  }
  set value(_) {
    this._ = _;
    for (const fn of this.$)
      batches ? batches.add(fn) : fn();
  }
  peek() { return this._ }
  toString() { return this._ }
  valueOf() { return this._ }
}

export const signal = value => new Signal(value);
