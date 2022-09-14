import './leak.js';
import * as usignal from '../esm/index.js';

setTimeout(
  async () => {
    (await import('./test.js')).default('usignal', usignal);
    (await import('./async.js')).default('usignal', usignal);
  },
  250
);
