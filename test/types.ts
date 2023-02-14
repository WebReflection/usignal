import { signal, computed } from '..'
import { expectType } from 'ts-expect'

const sig = signal(123)
expectType<number>(sig.value)
expectType<number>(sig.valueOf())
expectType<string>(sig.toString())
expectType<number>(sig.peek())
expectType<number>(sig.toJSON())
expectType<number>(await sig)
sig.then(v => expectType<number>(v))

const comp = computed(() => 213)
expectType<number>(comp.value)
expectType<number>(comp.valueOf())
expectType<string>(comp.toString())
expectType<number>(comp.peek())
expectType<number>(comp.toJSON())
expectType<number>(await comp)
comp.then(v => expectType<number>(v))

const compMix = computed(() => 'asd', 123)
expectType<number | string>(compMix.value)
expectType<number | string>(compMix.valueOf())
expectType<string>(compMix.toString())
expectType<number | string>(compMix.peek())
expectType<number | string>(compMix.toJSON())
expectType<number | string>(await compMix)
compMix.then(v => expectType<number | string>(v))