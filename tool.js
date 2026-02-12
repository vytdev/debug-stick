#!/usr/bin/env node

import child_process from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { isAsyncFunction } from 'util/types';

import tsconfig from './tsconfig.json' with { type: 'json' };
import manifest from './pack/manifest.json' with { type: 'json' };

const packVersion = manifest.header.version;
const packMinEngineVersion = manifest.header.min_engine_version;
const actionTable = {};


/* --- HELP --- */
actionTable['help'] = () => console.error(
    `usage: ${process.argv[1]} [task...]\n` +
    'Utility script for working with the debug-stick project.\n' +
    'Available tasks:\n' +
    '  help           Shows this help\n' +
    '  build          Run: npx tsc --build\n' +
    '  watch          Run: npx tsc --watch\n' +
    '  clean          Remove generated files\n' +
    '  pack           Generate dist packages\n' +
    '@vytdev'
  );


/* --- BUILD --- */
actionTable['build'] = async () => {
  try {
    const code = await runProcessAsync('npx', 'tsc', '--build');
    console.log('typescript exited with code: ' + code);
    return code;
  }
  catch (e) {
    printErr(e);
    return -1;
  }
};


/* --- WATCH --- */
actionTable['watch'] = async () => {
  try {
    const code = await runProcessAsync('npx', 'tsc', '--watch');
    console.log('typescript dev server exited with code: ' + code);
    return code;
  }
  catch (e) {
    printErr(e);
    return -1;
  }
};


/* --- CLEAN --- */
actionTable['clean'] = async () => {
  await fs.rm(tsconfig.compilerOptions.outDir, {
    force: true,
    recursive: true
  });
  console.log('cleanup complete');
};


/* --- PACK --- */
actionTable['pack'] = async () => {
  // name format for github
  await zipFolder('pack', 'debug-stick.zip');
  fs.copyFile('debug-stick.zip', 'debug-stick.mcpack');
  // name format for archiving
  fs.copyFile('debug-stick.zip',
      `debug-stick-${packVersion}.mcpack`);
  // name format for curseforge
  fs.copyFile('debug-stick.zip',
      `debug-stick-${packVersion}-r${packMinEngineVersion}.mcpack`);
  console.log('created distribution packages');
};


/**
 * Error printing utility.
 * @param msgs The messages.
 */
function printErr(...msgs) {
  console.error(`${process.argv[1]}:`, ...msgs);
}


/**
 * Asynchronously run a sub-process.
 * @param arg0 Name of or path to the executable.
 * @param args Arguments to pass to the process.
 * @returns A Promise.
 */
async function runProcessAsync(arg0, ...args) {
  return new Promise((resolve, reject) => {
    const subproc = child_process.spawn(arg0, args, { stdio: 'inherit' });
    // redirect sigint temporarily
    const sigIntHandler = () => subproc.kill('SIGINT');
    process.on('SIGINT', sigIntHandler);
    // handle success and failure
    subproc.on('close', code => {
      process.off('SIGINT', sigIntHandler);
      resolve(code || 0);
    });
    subproc.on('error', err => {
      process.off('SIGINT', sigIntHandler);
      reject(err)
    });
  });
}


/**
 * Zip an entire directory.
 * @param folderPath The folder to zip.
 * @param outPath Where to save the zip file.
 */
async function zipFolder(folderPath, outPath) {
  const zip = new JSZip();
  function addDirToZip(zipObj, folder) {
    const items = fsSync.readdirSync(folder);
    for (const item of items) {
      const fullPath = path.join(folder, item);
      const stats = fsSync.statSync(fullPath);
      if (stats.isDirectory()) {
        const subFolder = zipObj.folder(item);
        addDirToZip(subFolder, fullPath);
      } else {
        const data = fsSync.readFileSync(fullPath);
        zipObj.file(item, data);
      }
    }
  }
  addDirToZip(zip, folderPath);
  const content = await zip.generateAsync({ type: 'nodebuffer' });
  fsSync.writeFileSync(outPath, content);
}


// We must run from the repo folder.
process.chdir(path.dirname(process.argv[1]));

// Run each task in given order.
for (const task of process.argv.slice(2)) {
  const fn = actionTable[task];
  if (typeof fn !== 'function') {
    printErr('task does not exist: ' + task);
    continue;
  }

  // run the task synchronously
  console.log(`--- ${task} ---`);
  let code = isAsyncFunction(fn) ? await fn(task) : fn(task);
  code = (code || 0) & 0xff;
  if (code != 0) process.exit(code);
}
