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

export class Signal {
  constructor(_) {
    this._ = _;
  }
}

class Computed extends Signal {
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

class Reactive extends Signal {
  constructor(_) {
    super(_).$ = new Set;
  }
  get value() {
    if (effects)
      this.$.add(effects);
    return this._;
  }
  set value(_) {
    if (this._ !== _) {
      this._ = _;
      for (const fn of this.$)
        batches ? batches.add(fn) : fn();
    }
  }
  peek() { return this._ }
  toString() { return this._ }
  valueOf() { return this._ }
}

export const signal = value => new Reactive(value);
