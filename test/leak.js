import {argv, memoryUsage} from 'node:process';

const library = argv.find(arg => /^(?:preact|solid|solid-js)$/.test(arg));

console.log('');
console.log(`\x1b[1m${library || 'usignal'}\x1b[0m`);

const {signal, computed} = await import(
  library ?
    (library === 'preact' ?
      '@preact/signals-core' :
      './solid-to-usignal.js') :
    '../esm/index.js'
);


const signals = [];

for (let i = 65; i <= 90; i++)
  signals.push(signal(i));

let computeds = 0;

console.time('total time');
console.time('computed value creation');
let comp = computed(() => {
  computeds++;
  const out = [];
  for (const s of signals)
    out.push(`${String.fromCharCode(s.value)} => ${s.value}`);
  return out.join(', ');
});
console.timeEnd('computed value creation');

console.time('computed value retrieval');
console.log('\x1b[2m', comp.value.slice(0, 50) + '...', '\x1b[0m');
console.timeEnd('computed value retrieval');

console.time('updating 26 signals');
for (const s of signals)
  s.value++;
console.timeEnd('updating 26 signals');

console.time('computed value retrieval after update');
comp.value;
console.timeEnd('computed value retrieval after update');
console.timeEnd('total time');

setTimeout(() => {
  gc();
  for (const s of signals)
    s.value = 0;
  console.log('\n\x1b[1mAFTER\x1b[0m');
  console.table(memoryUsage());
  console.log('\n\x1b[1mCOMPUTED\x1b[0m', computeds);
  if (!library) {
    let leaks = 0;
    for (const s of signals)
      leaks += s.c.size;
    console.log('\n\x1b[1mLEAKS\x1b[0m', leaks);
    if (leaks !== 0)
      throw new Error(`Too many leaks: ${leaks}`);
  }
});

console.log('\n\x1b[1mBEFORE\x1b[0m');
console.table(memoryUsage());
