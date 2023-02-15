import { signal, computed } from '..'
import {expectTypeOf} from 'expect-type'

const sig = signal(123)
expectTypeOf(sig.value).toEqualTypeOf<number>()
expectTypeOf(sig.valueOf()).toEqualTypeOf<number>()
expectTypeOf(sig.toString()).toEqualTypeOf<string>()
expectTypeOf(sig.peek()).toEqualTypeOf<number>()
expectTypeOf(sig.toJSON()).toEqualTypeOf<number>()
expectTypeOf(await sig).toEqualTypeOf<number>()
sig.then(v => expectTypeOf(v).toEqualTypeOf<number>())

const comp = computed(() => 213)
expectTypeOf(comp.value).toEqualTypeOf<number>()
expectTypeOf(comp.valueOf()).toEqualTypeOf<number>()
expectTypeOf(comp.toString()).toEqualTypeOf<string>()
expectTypeOf(comp.peek()).toEqualTypeOf<number>()
expectTypeOf(comp.toJSON()).toEqualTypeOf<number>()
expectTypeOf(await comp).toEqualTypeOf<number>()
comp.then(v => expectTypeOf(v).toEqualTypeOf<number>())

const compMix = computed(() => 'asd', 123)
expectTypeOf(compMix.value).toEqualTypeOf<number | string>()
expectTypeOf(compMix.valueOf()).toEqualTypeOf<number | string>()
expectTypeOf(compMix.toString()).toEqualTypeOf<string>()
expectTypeOf(compMix.peek()).toEqualTypeOf<number | string>()
expectTypeOf(compMix.toJSON()).toEqualTypeOf<number | string>()
expectTypeOf(await compMix).toEqualTypeOf<number | string>()
compMix.then(v => expectTypeOf(v).toEqualTypeOf<number | string>())