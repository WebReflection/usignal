/*! (c) Andrea Giammarchi */

let batches;
export const batch = fn => {
  const prev = batches;
  batches = new Set;
  try {
    fn();
    for (const fn of batches)
      prev ? prev.add(fn) : fn();
  }
  finally { batches = prev }
};

let effects;
export const effect = fn => {
  const prev = effects;
  effects = fn;
  try { fn() }
  finally { effects = prev }
};

// this is useful only as instanceof brand check
// as new Signal doesn't mean computed or regular
// so I think there's not much point in using this
// constructor at all, if not for brand check.
// once you know a ref is a signal though, whatch out
// you won't know if you can set its value or not.
// I think we can differenziate between Signal and
// Computed as I did before ... but hey, folks out there
// already landed this, and I am OK(ish) with it.
export class Signal {
  constructor(_) { this._ = _ }
}

let computeds;
class Computed extends Signal {
  constructor(_) {
    super(_);
    this.c = void 0;  // computeds
    this.v = void 0;  // value
  }
  get value() {
    if (!this.c) {
      (this.c = () => {
        const prev = computeds;
        computeds = this.c;
        try { this.v = this._() }
        finally { computeds = prev }
      })();
    }
    return this.v;
  }
  set value(_) {
    throw new Error('computed are read-only');
  }
  toString() { return this.value }
  valueOf() { return this.value }
}

export const computed = value => new Computed(value);

class Reactive extends Signal {
  constructor(_) {
    super(_);
    this.c = new Set; // computeds
    this.e = new Set; // effects
  }
  get value() {
    if (computeds)
      this.c.add(computeds);
    if (effects)
      this.e.add(effects);
    return this._;
  }
  set value(_) {
    if (this._ !== _) {
      this._ = _;
      for (const fn of this.c) fn();
      for (const fn of this.e)
        batches ? batches.add(fn) : fn();
    }
  }
  peek() { return this._ }
  toString() { return this._ }
  valueOf() { return this._ }
}

export const signal = value => new Reactive(value);
