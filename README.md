# <em>µ</em>signal

[![Downloads](https://img.shields.io/npm/dm/usignal.svg)](https://www.npmjs.com/package/usignal) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/usignal/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/usignal?branch=main) [![build status](https://github.com/WebReflection/usignal/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/usignal/actions)

<sup>**Social Media Photo by [Carlos Alberto Gómez Iñiguez](https://unsplash.com/@iniguez) on [Unsplash](https://unsplash.com/)**</sup>

A blend of [@preact/signals-core](https://github.com/preactjs/signals) and [solid-js basic reactivity API](https://www.solidjs.com/docs/latest), with API and DX mostly identical to *@preact/signals-core* but extra goodness inspired by *solid-js*, 752 bytes minified with brotli.

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

To allow developers to tray and use different patterns there are a few variants of this module, still based on the very same core primitives:

  * `usignal/fn`, with its `*/sync` and `*/async` variants, where signals are callbacks so that `signal()` returns a its value, and `signal(value)` updates its value and return the new one, [inspired by S](https://github.com/adamhaile/S). Comouteds do not update anything so `computed()` returns values. This is a variant around the `.value` accessor pattern I don't necessarily disike, specially when we'd like to *signal* that a signal is being observed: `effect(() => { mySignal(); })`
  * `usignal/solid`, with its `*/sync` and `*/async` variants, where the module exports [createEffect](https://www.solidjs.com/docs/latest#createeffect), [createMemo](https://www.solidjs.com/docs/latest#creatememo), and [createSignal](https://www.solidjs.com/docs/latest#createsignal), mimicking the behavior (and returned values) as [solid-js basic reactivity API](https://www.solidjs.com/docs/latest/api). This is handy to compare the two or drop-in usignal in solid-js already based code.

---

## Differently thought ...

  * the default comparison for equality is not based on `===` but on [Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is). This might be a tiny, hopefully irrelevant, performance penalty, but I feel like guarding *NaN* cases in reactivity is a step forward to avoid infinite loops out of *NaN* poisoning some computation. *+0* and *-0* are less interesting cases to tackle, still these might be fundamental in some case, hence preserved in this moudle.

  * this library has lazy, non side-effecting, computed values, something [@preact/signals-core](https://github.com/preactjs/signals) recently introduced and [Solid 2.0 is planning to improve](https://twitter.com/RyanCarniato/status/1569815024964706304).

  * computed accepts an initial value otherwise passed as previous one by default, mimicking *solid-js* `useMemo(fn[, value[, options]])` signature.

  * both `signal(value[, options])` and `computed(fn[, value[, options]])` accept an optionally *options* argument, currently implementing [equals](https://www.solidjs.com/docs/latest#options) as explained in *silid-js* documentation.

  * both *signal* and *computed* also return a *thenable* instance that can be used to `await signal` or `await computed` without needing to use `await signal.value` or `await computed.value` out of [this poll](https://twitter.com/WebReflection/status/1571400086902476801).

Last, but not least, I was expecting from libraries that inspired this module is the ability to implicitly have signals values:

```js
const one = signal(1);
const two = signal(2);
const three = computed(() => one + two);

three.value;  // 3 indeed!
```

It's cool that other libaries use `toString` to simplify common string case integration, mostly with the DOM node, but it should also be welcomed a `valueOf` implementation, like *usignal* has, so that numeric values can actually be used as if they are, actually, numbers.

Addictionally, *usignal* has also a `toJSON` helper to serialize out of the box their value.

---

### TODO

- [ ] find out some good benchmark to test against *preact/signals-core* and *solid-js* to see if there's room for some improvement


## Tests

This module is 100% code covered, including ~~the *WeakRef*~~ possible leaks which is tested through the [test/leak.js](./test/leak.js) file, which is part of the *build* script process.

To use other libraries as reference, I have also added *preact/signals-core* and *solid-js* dev-dependencies within the test folder.

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
