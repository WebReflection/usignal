export default (library, {signal, computed, effect, batch, Signal}) => {

  console.log('');
  console.log(`\x1b[1m${library}\x1b[0m`);

  const assert = (what, why) => {
    console.assert(what);
    if (!what)
      throw new Error(`\x1b[1m${library}\x1b[0m: ${why}`);
  };

  if (library === 'usignal') {
    assert(JSON.stringify(signal(1)) === '1', 'JSON not working');
    assert((signal(1) + signal(2)) === 3, 'valueOf not working');
    testStoppedAsyncEffect();
    (async t => {
      assert(await signal(3) === 3, 'thenable signal');
      assert(await computed(() => 4) === 4, 'thenable computed');
      clearTimeout(t);
    })(setTimeout(assert, 1000, false, 'promise does not resolve'));

    const one = signal(1, {equals: false});
    const invokes = [];
    const dispose = effect(() => {
      invokes.push(one.value);
    });
    one.value = 1;
    assert(invokes.join(',') === '1,1', 'equals false not working');
  }

  assert(signal(0) instanceof Signal, 'signals are not instances of Signal');

  if (/^(?:usignal|@preact\/signals-core)$/.test(library)) {
    assert(computed(() => {}) instanceof Signal, 'computeds are not instances of Signal');
    let calls = 0;
    const $ = signal(0);
    const dispose = effect(() => {
      calls++;
      $.value;
      return () => calls++;
    });

    $.value = 1;
    assert(calls === 3, 'effect did not call again');

    dispose();
    assert(calls === 4, 'dispose did not invoke the calllback');
  }

  testPrimitive();
  testComputed();
  testEffect();
  testBatch();
  if (!/^(?:@webreflection\/signal)$/.test(library))
    testBatchMore();
  nestedBatch();
  readOnly();
  testPeek();
  testComputedUniqueness();
  if (!/^(?:@webreflection\/signal)$/.test(library))
    testComputedMoar();

  if (/^(?:usignal|@preact\/signals-core|@webreflection\/signal)$/.test(library))
    implicitToString();

  if (!/^(?:@webreflection\/signal)$/.test(library)) {
    testDiamond();
    loopedEffects();
  }

  nestedEffects();
  nestedIndependentEffects();
  testConditional();

  function testPrimitive() {
    const str = signal('string');
    assert(`a ${str}` === 'a string', 'toString not working');
  }

  function testComputed() {
    const name = signal('Jane');
    const surname = signal('Doe');

    const fullName = computed(() => name.value + ' ' + surname.value);

    assert(fullName.value === 'Jane Doe', 'computed not working');
    assert(`${fullName}` === 'Jane Doe', 'computed toString not working');
    assert(`${fullName + ''}` === 'Jane Doe', 'computed valueOf not working');

    name.value = 'John';
    assert(fullName.value === 'John Doe', 'computed not updating');
  }

  function testEffect() {
    const invokes = [];
    const name = signal('Jane');
    const surname = signal('Doe');
    const fullName = computed(() => name.value + ' ' + surname.value);

    const dispose = effect(() => {
      invokes.push(fullName.value);
    });

    assert(invokes.length === 1, 'effect not invoked');

    name.value = 'John';
    assert(invokes.length === 2, 'effect not re-invoked');
    assert(invokes.join('\n') === 'Jane Doe\nJohn Doe', 'unexpected effect');

    // testing same value doesn't side-effect
    name.value = 'John';
    assert(invokes.length === 2, 'effect side-effecting');
    assert(invokes.join('\n') === 'Jane Doe\nJohn Doe', 'unexpected side-effect');

    name.value = 'Jane';
    surname.value = 'Deo';
    assert(invokes.length === 4, 'non batched not working');
    assert(invokes.join('\n') === 'Jane Doe\nJohn Doe\nJane Doe\nJane Deo', 'unexpected non batched');

    if (dispose) {
      dispose();
      name.value = 'What';
      surname.value = 'Ever';
      assert(invokes.length === 4, 'dispose is not working');
    }
  }

  function testStoppedAsyncEffect() {
    const invokes = [];
    const dispose = effect(
      () => {
        invokes.push('this should not happen');
      },
      void 0,
      {async: true}
    );
    dispose();
    setTimeout(() => {
      assert(invokes.length === 0, 'async effect shold not have been triggered');
    });
  }

  function testBatch() {
    const invokes = [];
    const name = signal("Jane");
    const surname = signal("Doe");
    const fullName = computed(() => name.value + " " + surname.value);

    effect(() => {
      invokes.push(fullName.value);
    });

    assert(invokes.length === 1, 'effect not working in bached');

    batch(() => {
      name.value = "Foo";
      surname.value = "Bar";
    });

    assert(invokes.length === 2, 'batch not working');
    assert(invokes.join('\n') === 'Jane Doe\nFoo Bar', 'batch not updating');
  }

  function testBatchMore() {
    const invokes = [];
    const counter = signal(0);
    const double = computed(() => counter.value * 2);
    const tripple = computed(() => counter.value * 3);

    effect(() => {
      invokes.push([double.value, tripple.value]);
    });

    assert(invokes.length === 1, 'effect not working in bached more');

    batch(() => {
      counter.value = 1;
      assert(double.value === 2, 'computed side-effecting within batch');
    });

    assert(invokes.length === 2, 'unexpected more batched result');
    assert(invokes[0].join(',') === '0,0', 'unexpected batched more values');
    assert(invokes[1].join(',') === '2,3');
  }

  function nestedBatch() {
    const invokes = [];
    const counter = signal(0);

    effect(() => {
      invokes.push(counter.value);
    });

    assert(invokes.length === 1, 'effect not working in nested batches');

    batch(() => {
      batch(() => {
        counter.value = 1;
      });
      assert(invokes.length === 1, 'nested batch not working');
      assert(invokes[0] === 0, 'unexpected nested batch result');
    });

    assert(invokes.length === 2, 'nested batches fully not working');
    assert(invokes[1] === 1, 'unexpected nested batched invokes');
  }

  function readOnly() {
    const name = signal('Jane');
    const surname = signal('Doe');
    const fullName = computed(() => name.value + ' ' + surname.value);
    try {
      fullName.value = "";
      assert(false, 'read-only not working');
    }
    catch (expected) {}
  }

  function testPeek() {
    const invokes = [];
    const counter = signal(0);

    effect(() => {
      invokes.push(counter.peek());
    });

    assert(invokes.length === 1, 'effect not working in peek');
    assert(invokes[0] === 0, 'peek not returning right value');

    counter.value = 1;
    assert(invokes.length === 1, 'peek not working as expected');
  }

  function testComputedUniqueness() {
    let invokes = 0;
    const name = signal('Jane');
    const surname = {
      get value() {
        invokes++;
        return 'Doe';
      }
    };
    const fullName = computed(() => name.value + ' ' + surname.value);
    assert(fullName.value === 'Jane Doe', 'computed not working');
    assert(invokes === 1, 'computed value should have been invoked once');
    name.value = 'John';
    if (/^(?:usignal|@preact\/signals-core|@webreflection\/signal)$/.test(library)) fullName.value;
    assert(invokes === 2, 'computed value should have been invoked again');
    name.value = 'John';
    if (/^(?:usignal|@preact\/signals-core|@webreflection\/signal)$/.test(library)) fullName.value;
    assert(invokes === 2, 'computed value should NOT have been invoked again');
  }

  function testComputedMoar() {
    let BCalc = 0;
    let CCalc = 0;
    const A = signal(0);
    const B = computed(()=> {
      BCalc++;
      return A.value + 1;
    });
    const C = computed(() => {
      CCalc++;
      return A.value + B.value;
    });

    assert(
      JSON.stringify({
        B: [B.value, BCalc],
        C: [C.value, CCalc]
      }) === '{"B":[1,1],"C":[1,1]}',
      'unexpected amount of invokes'
    );

    A.value = 1;

    assert(
      JSON.stringify({
        B: [B.value, BCalc],
        C: [C.value, CCalc]
      }) === '{"B":[2,2],"C":[3,2]}',
      'unexpected amount of invokes after single change'
    );
  }

  function implicitToString() {
    let invokes = 0;
    const number = signal(1);
    const sum = computed(() => {
      invokes++;
      return `${number} + 2 = 3`;
    });
    assert(sum.value === '1 + 2 = 3', 'computed with toString() did not return the expected value');
    number.value = 0;
    assert(sum.value === '0 + 2 = 3', 'computed with toString() after value did not return the expected value');
    assert(invokes === 2, 'computed with toString() did not get invoked');
  }

  function testDiamond() {
    let BCalc = 0;
    let CCalc = 0;
    let DCalc = 0;
    const a = signal(1);
    const b = computed(() => {
      BCalc++;
      return a.value;
    });
    const c = computed(() => {
      CCalc++;
      return a.value;
    });
    const d = computed(() => {
      DCalc++;
      return b.value + c.value;
    });

    assert(d.value === 2, 'initial d value is wrong');
    assert([BCalc, CCalc, DCalc].join(',') === '1,1,1', 'initial calculation is wrong');
    a.value = 2;
    assert(d.value === 4, 'second d value is wrong');
    assert([BCalc, CCalc, DCalc].join(',') === '2,2,2', 'second calculation is wrong: ');
    a.value = 3;
    assert(d.value === 6, 'third d value is wrong');
    assert([BCalc, CCalc, DCalc].join(',') === '3,3,3', 'third calculation is wrong');
  }

  function loopedEffects() {
    const invokes = [];
    const num = signal(0);
    let loop = 2;

    effect(() => {
      invokes.push(num.value);
      for (let i = 0; i < loop; i++)
        effect(() => {
          invokes.push(num.value + i);
        });
    });

    assert(invokes.length === 3, 'looped effects not working');
    assert(invokes.join(',') === '0,0,1', 'looped values not matching');
  
    invokes.splice(0);
    loop = 1;
    num.value = 1;

    if (!/^(?:@preact\/signals-core)$/.test(library)) {
      assert(invokes.length === 2, 'looped effects not working after changes');
      assert(invokes.join(',') === '1,1', 'looped values not matching after changes');
    }
  }

  // check different output in preact/usignal/solid
  // even if the logic / result is almost same output
  function nestedEffects() {
    console.log('------');

    const counter = signal(1);
    const double = computed(() => {
      console.log('double');
      return counter.value * 2
    });
    const tripple = computed(() => {
      console.log('triple');
      return counter.value * 3;
    });

    const dispose1 = effect(() => {
      console.log('outer', double.value);
      effect(() => {
        console.log('nested', tripple.value);
      });
    });

    const dispose2 = effect(() => {
      console.log('a part', tripple.value);
    });

    console.log('- - -');
    counter.value = 20;
    console.log('------');
    console.log('');

    if (dispose1 && dispose2) {
      dispose1();
      dispose2();
      counter.value = 40;
    }
  }

  function nestedIndependentEffects() {
    console.log('------');

    const a = signal(1);
    const b = signal(1);

    effect(() => {
      console.log('outer', a.value);
      effect(() => {
        console.log('nested', b.value);
      });
    });

    effect(() => {
      console.log('a part', a.value);
    });

    console.log('- - -');
    a.value = 2;
    console.log('- - -');
    b.value = 3;
    console.log('- - -');
    a.value = 3;
    console.log('------');
    console.log('');
  }

  function testConditional() {
    const first = signal('John');
    const last = signal('Doe');
    const full = computed(() => {
      console.log('Computing name', first.value, last.value);
      return `${first.value} ${last.value}`;
    });
    const nickname = signal(undefined);

    effect(() => {
      if (nickname.value) {
        console.log('profile name', nickname.value);
      } else {
        console.log('profile name', full.value);
      }
    });

    nickname.value = 'jdoe';

    // this should _not_ execute effects, right?
    last.value = 'Smith';
  }
};
