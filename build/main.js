import { isAsyncFunction } from 'util/types';
import { cleanUp, compileSource, createDist, watchSource } from './tasks.js';


const actionTable = {};


/* --- HELP --- */
actionTable['help'] = () => console.error(
  `usage: ${process.argv[1]} [task...]\n` +
  'Utility script for working with the debug-stick project.\n' +
  'Available tasks:\n' +
  '  help           Shows this help\n' +
  '  pack           Create dist package\n' +
  '  build          Run: npx tsc --build\n' +
  '  watch          Run: npx tsc --watch\n' +
  '  clean          Remove generated files\n' +
  '@vytdev'
);


actionTable['pack'] = createDist;
actionTable['build'] = compileSource;
actionTable['watch'] = watchSource;
actionTable['clean'] = cleanUp;


// Run each task in given order.
for (const task of process.argv.slice(2)) {
  const fn = actionTable[task];
  if (typeof fn !== 'function') {
    console.error('task does not exist: ' + task);
    continue;
  }

  // run the task synchronously
  console.log(`--- ${task} ---`);
  let code = isAsyncFunction(fn) ? await fn(task) : fn(task);
  code = (code || 0) & 0xff;
  if (code != 0) process.exit(code);
}
