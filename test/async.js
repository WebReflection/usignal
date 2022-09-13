export default (library, {signal, computed, effect, batch, Signal}) => {

  console.log('');
  console.log(`\x1b[1m${library} async\x1b[0m`);

  const assert = (what, why) => {
    console.assert(what);
    if (!what)
      throw new Error(`\x1b[1m${library}\x1b[0m: ${why}`);
  };

  testEffect();

  function testEffect() {
    const invokes = [];
    const name = signal('Jane');
    const surname = signal('Doe');
    const fullName = computed(() => name.value + ' ' + surname.value);

    effect(
      () => {
        invokes.push(fullName.value);
      },
      true
    );

    assert(invokes.length === 0, 'effect should not be invoked');

    name.value = 'John';
    assert(invokes.length === 0, 'effect still not re-invoked');

    queueMicrotask(() => {
      assert(invokes.length === 1, 'effect should have been invoked once');
      assert(invokes.join('\n') === 'John Doe', 'unexpected effect');
    });
  }
};
