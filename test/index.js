const {signal, computed, effect, batch} = require('../cjs');

const assert = what => {
  console.assert(what);
  if (!what)
    throw new Error('unexpected result');
};

testPrimitive();
testComputed();
testEffect();
testBatch();
testBatchMore();
nestedBatch();
readOnly();

function testPrimitive() {
  const str = signal('string');
  assert(`a ${str}` === 'a string');
}

function testComputed() {
  const name = signal('Jane');
  const surname = signal('Doe');

  const fullName = computed(() => name.value + ' ' + surname.value);

  assert(fullName.value === 'Jane Doe');

  name.value = 'John';
  assert(fullName.value === 'John Doe');
}

function testEffect() {
  const invokes = [];
  const name = signal('Jane');
  const surname = signal('Doe');
  const fullName = computed(() => name.value + ' ' + surname.value);

  effect(() => {
    invokes.push(fullName.value);
  });

  assert(invokes.length === 1);

  name.value = 'John';
  assert(invokes.length === 2);
  assert(invokes.join('\n') === 'Jane Doe\nJohn Doe');

  name.value = 'Jane';
  surname.value = 'Deo';
  assert(invokes.length === 4);
  assert(invokes.join('\n') === 'Jane Doe\nJohn Doe\nJane Doe\nJane Deo');
}

function testBatch() {
  const invokes = [];
  const name = signal("Jane");
  const surname = signal("Doe");
  const fullName = computed(() => name.value + " " + surname.value);

  effect(() => {
    invokes.push(fullName.value);
  });

  assert(invokes.length === 1);

  batch(() => {
    name.value = "Foo";
    surname.value = "Bar";
  });

  assert(invokes.length === 2);
  assert(invokes.join('\n') === 'Jane Doe\nFoo Bar');
}

function testBatchMore() {
  const invokes = [];
  const counter = signal(0);
  const double = computed(() => counter.value * 2);
  const tripple = computed(() => counter.value * 3);

  effect(() => {
    invokes.push([double.value, tripple.value]);
  });

  assert(invokes.length === 1);

  batch(() => {
    counter.value = 1;
    assert(double.value === 2);
  });

  assert(invokes.length === 2);
  assert(invokes[0].join(',') === '0,0');
  assert(invokes[1].join(',') === '2,3');
}

function nestedBatch() {
  const invokes = [];
  const counter = signal(0);

  effect(() => {
    invokes.push(counter.value);
  });

  assert(invokes.length === 1);

  batch(() => {
    batch(() => {
      counter.value = 1;
    });
    assert(invokes.length === 1);
    assert(invokes[0] === 0);
  });

  assert(invokes.length === 2);
  assert(invokes[1] === 1);
}

function readOnly() {
  const name = signal('Jane');
  const surname = signal('Doe');
  const fullName = computed(() => name.value + ' ' + surname.value);
  try {
    fullName.value = "";
    assert(false);
  }
  catch (expected) {}
}
