import {memoryUsage} from 'node:process';

import {signal, computed} from '../esm/index.js';

const signals = [];

for (let i = 65; i <= 90; i++)
  signals.push(signal(i));

let comp = computed(() => {
  console.log('COMPUTED');
  const out = [];
  for (const s of signals)
    out.push(`${String.fromCharCode(s.value)} => ${s.value}`);
  return out.join('\n');
});

console.log(comp.value);

setTimeout(() => {
  gc();
  for (const s of signals)
    s.value = 0;
  console.log('\x1b[1mAFTER\x1b[0m');
  console.log(memoryUsage().heapUsed);
  let leaks = 0;
  for (const s of signals)
    leaks += s.c.size;
  console.log('\x1b[1mLEAKS\x1b[0m', leaks);
  if (leaks !== 0)
    throw new Error(`Too many leaks: ${leaks}`);
});

console.log('\x1b[1mBEFORE\x1b[0m');
console.log(memoryUsage().heapUsed);
