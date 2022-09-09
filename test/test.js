module.exports = (name, testValueOf, {signal, computed, effect, batch}) => {

  const assert = (what, why) => {
    console.assert(what);
    if (!what)
      throw new Error(`\x1b[1m${name}\x1b[0m: ${why}`);
  };

  if (testValueOf)
    assert((signal(1) + signal(2)) === 3, 'valueOf not working');

  testPrimitive();
  testComputed();
  testEffect();
  testBatch();
  testBatchMore();
  nestedBatch();
  readOnly();

  function testPrimitive() {
    const str = signal('string');
    assert(`a ${str}` === 'a string', 'toString not working');
  }

  function testComputed() {
    const name = signal('Jane');
    const surname = signal('Doe');

    const fullName = computed(() => name.value + ' ' + surname.value);

    assert(fullName.value === 'Jane Doe', 'computed not working');

    name.value = 'John';
    assert(fullName.value === 'John Doe', 'computed not updating');
  }

  function testEffect() {
    const invokes = [];
    const name = signal('Jane');
    const surname = signal('Doe');
    const fullName = computed(() => name.value + ' ' + surname.value);

    effect(() => {
      invokes.push(fullName.value);
    });

    assert(invokes.length === 1, 'effect not invoked');

    name.value = 'John';
    assert(invokes.length === 2, 'effect not re-invoked');
    assert(invokes.join('\n') === 'Jane Doe\nJohn Doe', 'unexpected effect');

    name.value = 'Jane';
    surname.value = 'Deo';
    assert(invokes.length === 4, 'non batched not working');
    assert(invokes.join('\n') === 'Jane Doe\nJohn Doe\nJane Doe\nJane Deo', 'unexpected non batched');
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
      assert(double.value === 2);
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
};
