/**
 * Extracted from: https://github.com/Riim/cellx#benchmark
 * Readapted from: https://github.com/maverick-js/observables#layers
 */

 import kleur from 'kleur';

 import * as cellx from 'cellx';
 import * as Sjs from 's-js';
 // @ts-expect-error
 import * as solid from './solid-js-baseline.js';
 import * as preact from '@preact/signals-core';
 import * as usignal from '../esm/index.js';
 import * as signal from '@webreflection/signal';
 import Table from 'cli-table';
 
 const RUNS_PER_TIER = 150;
 const LAYER_TIERS = [10, 100, 500, 1000, 2000, 2500];
 const BATCHED = process.argv.includes('--batched');
 
 const sum = (array) => array.reduce((a, b) => a + b, 0);
 const avg = (array) => sum(array) / array.length || 0;
 
 const SOLUTIONS = {
   10: [2, 4, -2, -3],
   100: [2, 2, 4, 2],
   500: [-2, 1, -4, -4],
   1000: [2, 2, 4, 2],
   2000: [-2, 1, -4, -4],
   2500: [2, 2, 4, 2],
 };

 let rand = 0;
 
 /**
  * @param {number} layers
  * @param {number[]} answer
  */
 const isSolution = (layers, answer) => answer.every((_, i) => {
  // if (SOLUTIONS[layers][i] !== _) console.log(layers, i, SOLUTIONS[layers][i], _);
  return SOLUTIONS[layers][i] === _;
 });
 
 async function main() {
   const report = {
     S: { fn: runS, runs: [] },
     solid: { fn: runSolid, runs: [] },
     'preact/signals': { fn: runPreact, runs: [] },
     // TODO: running too slow so I need to leave it out for now - maybe something is wrong.
     // sinuous: { fn: runSinuous, runs: [] },
     cellx: { fn: runCellx, runs: [] },
     usignal: { fn: runUsignal, runs: [] },
     signal: { fn: runSignal, runs: [] },
   };
 
   for (const lib of Object.keys(report)) {
     const current = report[lib];
 
     for (let i = 0; i < LAYER_TIERS.length; i += 1) {
       let layers = LAYER_TIERS[i];
       const runs = [];
       rand++;
       for (let j = 0; j < RUNS_PER_TIER; j += 1) {
         runs.push(await start(current.fn, layers));
       }
       // Give cellx time to release its global pendingCells array
       await new Promise((resolve) => setTimeout(resolve, 0));
 
       current.runs[i] = avg(runs) * 1000;
     }
   }
 
   const table = new Table({
     head: ['', ...LAYER_TIERS.map((n) => kleur.bold(kleur.cyan(n)))],
   });
 
   for (let i = 0; i < LAYER_TIERS.length; i += 1) {
     let min = Infinity,
       max = -1,
       fastestLib,
       slowestLib;
 
     for (const lib of Object.keys(report)) {
       const time = report[lib].runs[i];
 
       if (time < min) {
         min = time;
         fastestLib = lib;
       }
 
       if (time > max) {
         max = time;
         slowestLib = lib;
       }
     }
 
     report[fastestLib].runs[i] = kleur.green(report[fastestLib].runs[i].toFixed(2));
     report[slowestLib].runs[i] = kleur.red(report[slowestLib].runs[i].toFixed(2));
   }
 
   for (const lib of Object.keys(report)) {
     table.push([
       kleur.magenta(lib),
       ...report[lib].runs.map((n) => (typeof n === 'number' ? n.toFixed(2) : n)),
     ]);
   }
 
   console.log(table.toString());
 }
 
 async function start(runner, layers) {
   return new Promise((done) => {
     runner(layers, done);
   }).catch(() => -1);
 }
 
 /**
  * @see {@link https://github.com/adamhaile/S}
  */
 function runS(layers, done) {
   const S = Sjs.default;
 
   S.root(() => {
     const start = {
       a: S.data(1),
       b: S.data(2),
       c: S.data(3),
       d: S.data(4),
     };
 
     let layer = start;
 
     for (let i = layers; i--; ) {
       layer = ((m) => {
         const props = {
           a: S(() => rand % 2 ? m.b() : m.c()),
           b: S(() => m.a() - m.c()),
           c: S(() => m.b() + m.d()),
           d: S(() => m.c()),
         };
 
         S(props.a), S(props.b), S(props.c), S(props.d);
         return props;
       })(layer);
     }
 
     const startTime = performance.now();
 
     const run = BATCHED ? (fn) => fn() : (fn) => fn();
     run(() => {
       start.a(4), start.b(3), start.c(2), start.d(1);
     });
 
     const end = layer;
     const solution = [end.a(), end.b(), end.c(), end.d()];
     const endTime = performance.now() - startTime;
 
     done(isSolution(layers, solution) ? endTime : -1);
   });
 }
 
 /**
  * @see {@link https://github.com/solidjs/solid}
  */
 function runSolid(layers, done) {
   solid.createRoot(async (dispose) => {
     const [a, setA] = solid.createSignal(1),
       [b, setB] = solid.createSignal(2),
       [c, setC] = solid.createSignal(3),
       [d, setD] = solid.createSignal(4);
 
     const start = { a, b, c, d };
 
     let layer = start;
 
     for (let i = layers; i--; ) {
       layer = ((m) => {
         const props = {
           a: solid.createMemo(() => rand % 2 ? m.b() : m.c()),
           b: solid.createMemo(() => m.a() - m.c()),
           c: solid.createMemo(() => m.b() + m.d()),
           d: solid.createMemo(() => m.c()),
         };
 
         return props;
       })(layer);
     }
 
     const startTime = performance.now();
 
     const run = BATCHED ? solid.batch : (fn) => fn();
     run(() => {
       setA(4), setB(3), setC(2), setD(1);
     });
 
     const end = layer;
     const solution = [end.a(), end.b(), end.c(), end.d()];
     const endTime = performance.now() - startTime;
 
     dispose();
     done(isSolution(layers, solution) ? endTime : -1);
   });
 }
 
 /**
  * @see {@link https://github.com/preactjs/signals}
  */
 function runPreact(layers, done) {
   const a = preact.signal(1),
     b = preact.signal(2),
     c = preact.signal(3),
     d = preact.signal(4);
 
   const start = { a, b, c, d };
 
   let layer = start;
 
   for (let i = layers; i--; ) {
     layer = ((m) => {
       const props = {
         a: preact.computed(() => rand % 2 ? m.b.value : m.c.value),
         b: preact.computed(() => m.a.value - m.c.value),
         c: preact.computed(() => m.b.value + m.d.value),
         d: preact.computed(() => m.c.value),
       };
 
       return props;
     })(layer);
   }
 
   const startTime = performance.now();
 
   const run = BATCHED ? preact.batch : (fn) => fn();
   run(() => {
     (a.value = 4), (b.value = 3), (c.value = 2), (d.value = 1);
 
     const end = layer;
     const solution = [end.a.value, end.b.value, end.c.value, end.d.value];
     const endTime = performance.now() - startTime;
 
     done(isSolution(layers, solution) ? endTime : -1);
   });
 }
 
 /**
  * @see {@link https://github.com/Riim/cellx}
  */
 function runCellx(layers, done) {
   const start = {
     a: new cellx.Cell(1),
     b: new cellx.Cell(2),
     c: new cellx.Cell(3),
     d: new cellx.Cell(4),
   };
 
   let layer = start;
 
   for (let i = layers; i--; ) {
     layer = ((m) => {
       const props = {
         a: new cellx.Cell(() => rand % 2 ? m.b.get() : m.c.get()),
         b: new cellx.Cell(() => m.a.get() - m.c.get()),
         c: new cellx.Cell(() => m.b.get() + m.d.get()),
         d: new cellx.Cell(() => m.c.get()),
       };
 
       props.a.on('change', function () {});
       props.b.on('change', function () {});
       props.c.on('change', function () {});
       props.d.on('change', function () {});
 
       return props;
     })(layer);
   }
 
   const startTime = performance.now();
 
   start.a.set(4);
   start.b.set(3);
   start.c.set(2);
   start.d.set(1);
 
   const end = layer;
   const solution = [end.a.get(), end.b.get(), end.c.get(), end.d.get()];
   const endTime = performance.now() - startTime;
 
   start.a.dispose();
   start.b.dispose();
   start.c.dispose();
   start.d.dispose();
 
   done(isSolution(layers, solution) ? endTime : -1);
 }

 /**
  * @see {@link https://github.com/WebReflection/usignal}
  */
  function runUsignal(layers, done) {
    const a = usignal.signal(1),
      b = usignal.signal(2),
      c = usignal.signal(3),
      d = usignal.signal(4);
  
    const start = { a, b, c, d };
  
    let layer = start;
  
    for (let i = layers; i--; ) {
      layer = ((m) => {
        const props = {
          a: usignal.computed(() => rand % 2 ? m.b.value : m.c.value),
          b: usignal.computed(() => m.a.value - m.c.value),
          c: usignal.computed(() => m.b.value + m.d.value),
          d: usignal.computed(() => m.c.value),
        };
  
        return props;
      })(layer);
    }
  
    const startTime = performance.now();
  
    const run = BATCHED ? usignal.batch : (fn) => fn();
    run(() => {
      (a.value = 4), (b.value = 3), (c.value = 2), (d.value = 1);
  
      const end = layer;
      const solution = [end.a.value, end.b.value, end.c.value, end.d.value];
      const endTime = performance.now() - startTime;
  
      done(isSolution(layers, solution) ? endTime : -1);
    });
  }
 
 /**
  * @see {@link https://github.com/WebReflection/signal}
  */
  function runSignal(layers, done) {
    const a = signal.signal(1),
      b = signal.signal(2),
      c = signal.signal(3),
      d = signal.signal(4);
  
    const start = { a, b, c, d };
  
    let layer = start;
  
    for (let i = layers; i--; ) {
      layer = ((m) => {
        const props = {
          a: signal.computed(() => rand % 2 ? m.b.value : m.c.value),
          b: signal.computed(() => m.a.value - m.c.value),
          c: signal.computed(() => m.b.value + m.d.value),
          d: signal.computed(() => m.c.value),
        };
  
        return props;
      })(layer);
    }
  
    const startTime = performance.now();
  
    const run = BATCHED ? signal.batch : (fn) => fn();
    run(() => {
      (a.value = 4), (b.value = 3), (c.value = 2), (d.value = 1);
  
      const end = layer;
      const solution = [end.a.value, end.b.value, end.c.value, end.d.value];
      const endTime = performance.now() - startTime;
  
      done(isSolution(layers, solution) ? endTime : -1);
    });
  }
 
 main();
 