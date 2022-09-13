# usignal

[![build status](https://github.com/WebReflection/usignal/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/usignal/actions) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/usignal/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/usignal?branch=main)

<sup>**Social Media Photo by [Carlos Alberto Gómez Iñiguez](https://unsplash.com/@iniguez) on [Unsplash](https://unsplash.com/)**</sup>

An alternative to [@preact/signals-core](https://github.com/preactjs/signals).

```js
import {signal, computed, effect, batch, Signal} from 'usignal';
// const {signal, computed, effect, batch, Signal} = require('usignal');
// usignal/sync and usignal/async ar ealso valid exports
// each version exports an enforced, always a/sync effect function

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

It's cool that other libaries use `toString` to simplify common string case integration, mostly with the DOM node, but it should also be welcomed a `valueOf` implementation, like *usignal* has, so that numeric values can actually be used like they are, actually, numbers.


### TODO

- [x] provide *async* effects to play well with libraries based on signals - v0.4.0
- [ ] find out some good benchmark to test against *preact/signals-core* and *solid-js* to see if there's room for some improvement

