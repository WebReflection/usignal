import {argv} from 'node:process';

const library = argv.find(arg => /^(?:preact|solid|solid-js)$/.test(arg));

import(
  library ?
    (library === 'preact' ?
      './preact.js' :
      './solid.js') :
    './usignal.js'
);
