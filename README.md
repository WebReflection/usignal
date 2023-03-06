# <em>µ</em>signal

[![Downloads](https://img.shields.io/npm/dm/usignal.svg)](https://www.npmjs.com/package/usignal) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/usignal/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/usignal?branch=main) [![build status](https://github.com/WebReflection/usignal/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/usignal/actions)

<sup>**Social Media Photo by [Carlos Alberto Gómez Iñiguez](https://unsplash.com/@iniguez) on [Unsplash](https://unsplash.com/)**</sup>

A blend of [@preact/signals-core](https://github.com/preactjs/signals) and [solid-js basic reactivity API](https://www.solidjs.com/docs/latest), with API and DX mostly identical to *@preact/signals-core* but extra goodness inspired by *solid-js*, 803 bytes minified with brotli.

```js
import {signal, computed, effect, batch, Signal} from 'usignal';
// const {signal, computed, effect, batch, Signal} = require('usignal');

signal(0) instanceof Signal;          // true
computed(() => {}) instanceof Signal; // true

effect(
  () => { console.log('fx') },
  void 0,       // optional value to pass along the callback as initial/prev value
  {async: true} // optionally make the effect async: false by default
);

// try every example shown in
// https://github.com/preactjs/signals
// or see test/index.js file to see it in action
```

#### Exports

This is a *dual module* so it works in either *CommonJS* or *ECMAScript* module systems.

  * `usignal/sync` exports with an enforced *sync* effect
  * `usignal/async` exports with an enforced *async* effect
  * `usignal` in *browsers* exports `usignal/async` and `usignal/sync` in *servers* or by *default*
  * `usignal/core` just exports the *effect* as callback that accepts an effect and an optionally asynchronous `true` flag, used by all other exports by default, but you decide if a specific effect should sync or async.
  * the [unpkg/usignal](https://unpkg.com/usignal) default export points at the pre minified [es.js](./es.js) file without any enforcement around *effect*, like `usignal/core`, so that all effects are *sync* by default but can be *async* passing `true` as second parameter

Current exports are exactly these:

```js
import {
  signal,
  computed,
  effect,
  batch,
  Signal
} from 'usignal';
```

The `Signal` export is useful only as brand check for either *computed* or *signal* references, but it cannot be used as constructor right away.


#### Exports - Extra

To allow developers to try and use different patterns there are a few variants of this module, still based on the very same core primitives:

  * `usignal/fn`, with its `*/sync` and `*/async` variants, where signals are callbacks so that `signal()` returns a its value, and `signal(value)` updates its value and return the new one, [inspired by S](https://github.com/adamhaile/S). Computeds do not update anything so `computed()` returns values. This is a variant around the `.value` accessor pattern I don't necessarily disike, specially when we'd like to *signal* that a signal is being observed: `effect(() => { mySignal(); })`
  * `usignal/solid`, with its `*/sync` and `*/async` variants, where the module exports [createEffect](https://www.solidjs.com/docs/latest#createeffect), [createMemo](https://www.solidjs.com/docs/latest#creatememo), and [createSignal](https://www.solidjs.com/docs/latest#createsignal), mimicking the behavior (and returned values) as [solid-js basic reactivity API](https://www.solidjs.com/docs/latest/api). This is handy to compare the two or drop-in usignal in solid-js already based code.

---

## Differently thought ...

  * the default comparison for equality is not based on `===` but on [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is). This might be a tiny, hopefully irrelevant, performance penalty, but I feel like guarding *NaN* cases in reactivity is a step forward to avoid infinite loops out of *NaN* poisoning some computation. *+0* and *-0* are less interesting cases to tackle, still these might be fundamental in some case, hence preserved in this moudle.

  * this library has lazy, non side-effecting, computed values, something [@preact/signals-core](https://github.com/preactjs/signals) recently introduced and [Solid 2.0 is planning to improve](https://twitter.com/RyanCarniato/status/1569815024964706304).

  * computed accepts an initial value otherwise passed as previous one by default, mimicking *solid-js* `useMemo(fn[, value[, options]])` signature.

  * effect passes along its initial value or the previoulsy returned one. If this is a function though, it runs it before re-executing, passing along its returned value, if any.

  * both `signal(value[, options])` and `computed(fn[, value[, options]])` accept an optionally *options* argument, currently implementing [equals](https://www.solidjs.com/docs/latest#options) as explained in *solid-js* documentation.

  * both *signal* and *computed* also have a `toJSON` and a `valueOf()` allowing to implicitly use their values, e.g.

```js
const one = signal(1);
const two = signal(2);
const three = computed(() => one + two);

three.value;  // 3 indeed!
```

---


## Benchmark

The benchmark currently compares *S*, *solid*, *preact/signals*, and *cellx* against *usignal*.

Please note *preact* is currently not able to solve nested effects so its logic might be simpler than other libraries.

```sh
npm run benchmark
```

![current status](./test/benchmark.png)


## Tests

This module is 100% code covered, including ~~the *WeakRef*~~ possible leaks which is tested through the [test/leak.js](./test/leak.js) file, which is part of the *build* script process.

To use other libraries as reference, I have also added *preact/signals-core* and *solid-js* dev-dependencies within the test folder.

Please note *preact* is currently not able to solve nested effects so its logic might be simpler than other libraries.

The following instructions are needed to test other libraries too:

```sh
cd usignal
npm i
cd test
npm i
cd ..

# normal tests
npm test usignal      # shows also code-coverage
npm test solid
npm test preact

# leak test
npm run leak usignal  # calculate leaks via internals
npm run leak solid
npm run leak preact
```

#### About the leak test

This file is not meant at all as meaningful benchmark against other libraries, it's simply there to allow me to spot regressions on future updates of the library:
  * ~~there should be zero leaks on signals when a computed reference is garbage collected~~ v0.5.0 removed the *WeakRef*, computeds go when signals go ... [but why?!](https://twitter.com/WebReflection/status/1570380914613694466)
  * the amount of used memory should always be lower than the initial one
  * the performance should be competitive compared to others

## How to integrate with Lit

You create a following [mixin](https://lit.dev/docs/composition/mixins/) function. Your class inherits from Mixin. Please see the [demo](https://lit.dev/playground/#project=W3sibmFtZSI6InNpZ25hbC1leGFtcGxlLmpzIiwiY29udGVudCI6ImltcG9ydCB7IGh0bWwsIGNzcywgTGl0RWxlbWVudCB9IGZyb20gJ2xpdCc7XG5pbXBvcnQgeyBXaXRoVXNpZ25hbCB9IGZyb20gJy4vd2l0aC11c2lnbmFsLmpzJztcbmltcG9ydCB7IHNpZ25hbCB9IGZyb20gJ3VzaWduYWwnO1xuXG5jb25zdCBjb3VudGVyID0gc2lnbmFsKDEpO1xuY29uc3QgY291bnRlcjIgPSBzaWduYWwoMSk7XG5cbmNsYXNzIFNpZ25hbEV4YW1wbGUgZXh0ZW5kcyBXaXRoVXNpZ25hbChMaXRFbGVtZW50KSB7XG4gIHN0YXRpYyBzdHlsZXMgPSBjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBib3JkZXI6IHNvbGlkIDFweCBibHVlO1xuICAgICAgcGFkZGluZzogOHB4O1xuICAgICAgbWFyZ2luOiA0cHg7XG4gICAgfVxuICBgO1xuXG4gIHN0YXRpYyBwcm9wZXJ0aWVzID0ge1xuICAgIGNvdW50OiB7IHN0YXRlOiB0cnVlIH0sXG4gICAgbmFtZToge31cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb3VudCA9IDE7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8aDQ-JHt0aGlzLm5hbWV9PC9oND5cbiAgICAgIDxwPlxuICAgICAgICBTaWduYWwgY291bnRlcjogJHtjb3VudGVyfVxuICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0-IGNvdW50ZXIudmFsdWUrK30-Kys8L2J1dHRvbj5cbiAgICAgIDwvcD5cbiAgICAgIDxwPlxuICAgICAgICBSZWFjdGl2ZSBwcm9wZXJ0eSBjb3VudGVyOiAke3RoaXMuY291bnR9XG4gICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jb3VudCsrfT4rKzwvYnV0dG9uPlxuICAgICAgPC9wPlxuICAgICAgJHsgdGhpcy5jb3VudCA-IDIgPyBodG1sYFxuICAgICAgIDxwPlxuICAgICAgICBTaWduYWwgY291bnRlcjogJHtjb3VudGVyMn1cbiAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiBjb3VudGVyMi52YWx1ZSsrfT4rKzwvYnV0dG9uPlxuICAgICAgIDwvcD5gIDogbnVsbH0gICAgICAgIFxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdzaWduYWwtZXhhbXBsZScsIFNpZ25hbEV4YW1wbGUpOyJ9LHsibmFtZSI6ImluZGV4Lmh0bWwiLCJjb250ZW50IjoiPCFET0NUWVBFIGh0bWw-XG48aHRtbD5cbiAgPGhlYWQ-XG4gICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiLi9zaWduYWwtZXhhbXBsZS5qc1wiPjwvc2NyaXB0PlxuICAgIDxzdHlsZT5cbiAgICAgIGJvZHkge1xuICAgICAgICBmb250LXNpemU6IDEuMjVyZW07XG4gICAgICAgIGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO1xuICAgICAgfVxuICAgIDwvc3R5bGU-XG4gIDwvaGVhZD5cbiAgPGJvZHk-XG4gICAgPHNpZ25hbC1leGFtcGxlIG5hbWU9XCJJbnN0YW5jZSAxXCI-PC9zaWduYWwtZXhhbXBsZT5cbiAgICA8c2lnbmFsLWV4YW1wbGUgbmFtZT1cIkluc3RhbmNlIDJcIj48L3NpZ25hbC1leGFtcGxlPlxuICA8L2JvZHk-XG48L2h0bWw-In0seyJuYW1lIjoicGFja2FnZS5qc29uIiwiY29udGVudCI6IntcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibGl0XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJAbGl0L3JlYWN0aXZlLWVsZW1lbnRcIjogXCJeMS4wLjBcIixcbiAgICBcImxpdC1lbGVtZW50XCI6IFwiXjMuMC4wXCIsXG4gICAgXCJsaXQtaHRtbFwiOiBcIl4yLjAuMFwiXG4gIH1cbn0iLCJoaWRkZW4iOnRydWV9LHsibmFtZSI6IndpdGgtdXNpZ25hbC5qcyIsImNvbnRlbnQiOiJpbXBvcnQgeyBlZmZlY3QsIHNpZ25hbCB9IGZyb20gJ3VzaWduYWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gV2l0aFVzaWduYWwoQmFzZSl7XG4gIHJldHVybiBjbGFzcyBXaXRoVXNpZ25hbCBleHRlbmRzIEJhc2Uge1xuICAgICNkaXNwb3NlRWZmZWN0XG4gICAgI3JlYWN0aXZlUHJvcFVwZGF0ZSA9IHNpZ25hbCgwKTtcblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgdGhpcy4jZGlzcG9zZUVmZmVjdD8uKCk7XG4gICAgfVxuXG4gICAgcGVyZm9ybVVwZGF0ZSgpIHtcbiAgICAgIGlmICghdGhpcy5pc1VwZGF0ZVBlbmRpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy4jZGlzcG9zZUVmZmVjdCkge1xuICAgICAgICB0aGlzLiNyZWFjdGl2ZVByb3BVcGRhdGUudmFsdWUrKztcbiAgICAgIH1cblxuICAgICAgdGhpcy4jZGlzcG9zZUVmZmVjdCA9IGVmZmVjdCgoKSA9PiB7ICAgICAgXG4gICAgICAgIHRoaXMuaXNVcGRhdGVQZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy4jcmVhY3RpdmVQcm9wVXBkYXRlLnZhbHVlO1xuICAgICAgICBzdXBlci5wZXJmb3JtVXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59In1d) for details.

```js
import { effect, signal } from 'usignal';

export function WithUsignal(Base){
  return class WithUsignal extends Base {
    #disposeEffect
    #reactivePropUpdate = signal(0);

    disconnectedCallback() {
      this.#disposeEffect?.();
    }

    performUpdate() {
      if (!this.isUpdatePending) {
        return;
      }

      if (this.#disposeEffect) {
        this.#reactivePropUpdate.value++;
        return;
      }

      this.#disposeEffect = effect(() => {      
        this.isUpdatePending = true;
        this.#reactivePropUpdate.value;
        super.performUpdate();
      });
    }
  };
}
```
