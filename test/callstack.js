import * as usignal from '../esm/index.js';

const report = {};

testUsignal(report, 500000);

console.table(report);

function testUsignal(report, layerCount) {
  var start = {
    prop1: usignal.signal(1),
    prop2: usignal.signal(2),
    prop3: usignal.signal(3),
    prop4: usignal.signal(4)
  };

  var layer = start;

  for (var i = layerCount; i--; ) {
    layer = (function (m) {
      var s = {
        prop1: usignal.computed(function () {
          return m.prop2.value;
        }),
        prop2: usignal.computed(function () {
          return m.prop1.value - m.prop3.value;
        }),
        prop3: usignal.computed(function () {
          return m.prop2.value + m.prop4.value;
        }),
        prop4: usignal.computed(function () {
          return m.prop3.value;
        })
      };

      usignal.computed(() => s.prop1.value);
      usignal.computed(() => s.prop2.value);
      usignal.computed(() => s.prop3.value); 
      usignal.computed(() => s.prop4.value);

      s.prop1.value;
      s.prop2.value;
      s.prop3.value;
      s.prop4.value;

      return s;
    })(layer);
  }

  var end = layer;

  report.layers = layerCount;
  report.beforeChange = [end.prop1.value, end.prop2.value, end.prop3.value, end.prop4.value];

  var st = performance.now();

  start.prop1.value = 4;
  start.prop2.value = 3;
  start.prop3.value = 2;
  start.prop4.value = 1;

  report.afterChange = [end.prop1.value, end.prop2.value, end.prop3.value, end.prop4.value];

  report.recalculationTime = performance.now() - st;
}