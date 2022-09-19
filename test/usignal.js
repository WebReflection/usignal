import './leak.js';
import * as usignal from '../esm/index.js';

setTimeout(
  async () => {
    (await import('./test.js')).default('usignal', usignal);
    (await import('./async.js')).default('usignal', usignal);
  },
  250
);

import {signal, computed} from '../esm/fn/index.js';

var s = signal(0);
var c = computed(() => s.value);

console.assert(s() === 0 && c() === 0);
console.assert(s(1) === 1 && c() === 1);

import {createEffect, createMemo, createSignal} from '../esm/solid/index.js';

var [s, u] = createSignal(() => 0);
var c = createMemo(() => s());

createEffect(
  prev => {
    console.assert(s() === prev && c() === prev);
  },
  0
);

console.assert(s() === 0);
u(1);
console.assert(s() === 1);
