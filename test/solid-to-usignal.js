import {batch, createEffect, createMemo, createSignal} from "./node_modules/solid-js/dist/solid.js";

class Computed {
  constructor(_) {
    this._ = createMemo(_);
  }
  get value() {
    return this._();
  }
  toString() {
    return this.value;
  }
}

class Signal {
  constructor(_) {
    const [s, u] = createSignal(_);
    this.s = s;
    this.u = u;
    this._ = _;
  }
  get value() {
    return this.s();
  }
  set value(_) {
    this._ = _;
    this.u(_);
  }
  peek() {
    return this._;
  }
  toString() {
    return this.value;
  }
}

const computed = _ => new Computed(_);
const effect = createEffect;
const signal = _ => new Signal(_);

export {batch, computed, effect, signal, Signal};
