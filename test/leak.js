import {argv, memoryUsage} from 'node:process';

const BATCHED = argv.includes('batched');
const library = argv.find(arg => /^(?:preact|signal|solid|solid-js)$/.test(arg));

console.log('');
console.log(`\x1b[1m${library || 'usignal'}\x1b[0m`, BATCHED ? 'batched' : '');

const {batch, effect, signal, computed} = await import(
  library ?
    (library === 'preact' ?
      '@preact/signals-core' :
      (library === 'signal' ?
        '@webreflection/signal' :
        './solid-to-usignal.js'
      )
    ) :
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

let compute = true;

console.time('effect creation');
const dispose = effect(() => {
  if (compute) {
    compute = false;
    console.time('computed value retrieval');
    console.log('\x1b[2m', comp.value.slice(0, 50) + '...', '\x1b[0m');
    console.timeEnd('computed value retrieval');
  }
});
console.timeEnd('effect creation');

console.time('updating 26 signals');

const updates = () => {
  for (const s of signals)
    s.value++;
};

if (BATCHED)
  batch(updates);
else
  updates();

console.timeEnd('updating 26 signals');

console.log('\x1b[1mcomputed\x1b[0m', computeds);

if (dispose) {
  console.time('effect disposal');
  dispose();
  console.timeEnd('effect disposal');
}

console.time('computed value retrieval after update');
comp.value;
console.timeEnd('computed value retrieval after update');
console.timeEnd('total time');

comp = null;
signals.splice(0);

setTimeout(() => {
  gc();
  showMem('AFTER');

  if (dispose) {
    console.time('effect disposal');
    dispose();
    console.timeEnd('effect disposal');
  }
});

const showMem = title => {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
  const prev = memory;
  memory = memoryUsage();
  if (prev && memory.heapUsed > prev.heapUsed)
    throw new Error(`\n\x1b[1m\x1b[7m MEMORY INCREASED \x1b[0m ${memory.heapUsed - prev.heapUsed}\n`);
  console.table(memory);
};

let memory;
showMem('BEFORE');
