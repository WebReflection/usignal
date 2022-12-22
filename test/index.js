import {argv} from 'node:process';

const library = argv.find(arg => /^(?:preact|signal|solid|solid-js)$/.test(arg));

import(
  library ?
    (library === 'preact' ?
      './preact.js' :
      (library === 'signal' ?
        './signal.js' :
        './solid.js'
      )
    ) :
    './usignal.js'
);
