# usignal

[![build status](https://github.com/WebReflection/usignal/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/usignal/actions) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/usignal/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/usignal?branch=main)

<sup>**Social Media Photo by [Carlos Alberto Gómez Iñiguez](https://unsplash.com/@iniguez) on [Unsplash](https://unsplash.com/)**</sup>

An alternative to [@preact/signals-core](https://github.com/preactjs/signals), 714 bytes minified with brotli.

```js
import {signal, computed, effect, batch, Signal} from 'usignal';
// const {signal, computed, effect, batch, Signal} = require('usignal');

signal(0) instanceof Signal;          // true
computed(() => {}) instanceof Signal; // true

effect(
  () => { console.log('fx') },
  true  // optionally make the effect async: false by default
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
  * the [unpkg/usignal](https://unpkg.com/usignal) default export points at the pre minified [es.js](./es.js) file without any enforcement around *effect* so that alleffects are *sync* by default but can be *async* passing `true` as second parameter

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

---

## Differently thought ...

This library has lazy computed values no matter what, because while refactoring it after other libraries such as [@preact/signals-core](https://github.com/preactjs/signals) and [solid-js](https://github.com/solidjs) I've noticed a slightly "*gotcha*" in the computed logic:

  * the goal of a *computed* value is to provide its latest result without reinvoking a potentially expensive callback
  * many *computed* values can depend on the very same *signal*, so the relation *signal* -> *computed* re-calculation is 1 to many
  * accordingly with the previous point, a single *signal* value change can "*stop the world*" but maybe only few *computed* were used inside *effects* and these should be also able to accept many *signals* updates without re-calculating per each of them their expensive result
  * in short, all *computed* values here are *lazy*, meaning they re-calculate their result *only* when their *value* is accessed, not as side-effect
  * whenever a *signal* update should *effect* to the logic, feel free to use *computed* callbacks inside such *effect* so that everything works transparently as meant, but only the involved computed will be re-calculated in that *effect*, as opposite of all of them without being needed or used right away
  * using *effects* when effects are meant, felt better than having all *computed* somehow "*effecting*" the whole execution
  * as a matter of fact, *effects* are *computed* (literally `Effect extends Computed`) with an *invoke ASAP* logic instead of the lazy one

If I got this part wrong please let me know through use cases that show a *computed* should always re-calc its value on a single graph *signal* dependency, thank you!

### Also differently ...

One thing I was expecting from libraries that inspired this module is the ability to implicitly have signals values:

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

- [x] provide *async* effects to play well with libraries based on signals - v0.4.x
- [ ] find out some good benchmark to test against *preact/signals-core* and *solid-js* to see if there's room for some improvement


## Tests

This module is 100% code covered, including the *WeakRef* which is tested through the [test/leak.js](./test/leak.js) file, which is part of the *build* script process.

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
  * there should be zero leaks on signals when a computed reference is garbage collected
  * the amount of used memory should always be lower than the initial one
  * the performance should be competitive compared to others
