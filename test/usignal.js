import './leak.js';
import * as usignal from '../esm/index.js';

const library = 'usignal';

const assert = (what, why) => {
  console.assert(what);
  if (!what)
    throw new Error(`\x1b[1m${library}\x1b[0m: ${why}`);
};

setTimeout(
  async () => {
    (await import('./test.js')).default('usignal', usignal);
    (await import('./async.js')).default('usignal', usignal);
  },
  250
);

import {signal, computed} from '../esm/fn/index.js';

var s = signal(0);
var c = computed(() => s());

assert(s() === 0 && c() === 0, 'wrong initial value');
assert(s(1) === 1 && c() === 1, 'wrong updated value');

import {createEffect, createMemo, createSignal} from '../esm/solid/index.js';

var [s, u] = createSignal(() => 0);
var c = createMemo(() => s());

createEffect(
  prev => {
    assert(s() === prev && c() === prev);
    return s() + 1;
  },
  0
);

assert(s() === 0);
u(1);
assert(s() === 1);
