import JSZip from 'jszip';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import config from '../config.js';
import { addDirToZip, formatString, runProcessAsync, writeZip } from './utils.js';
import { runtimeConfigTable, makeConfigScript } from './gen_config.js';
import { genManifest, stringifyManifest } from './gen_manifest.js';


/**
 * Compile source code.
 */
export async function compileSource() {
  console.log('compiling source ...');
  const err = await runProcessAsync('npx', 'tsc', '--build');
  console.log('typescript exited with code: ' + err);
}


/**
 * Start live incremental compilation.
 */
export async function watchSource() {
  console.log('watching src/ ...');
  const err = await runProcessAsync('npx', 'tsc', '--watch');
  console.log('stopped watching src/ !');
  console.log('typescript exited with code: ' + err);
}


/**
 * Add LICENSE file.
 * @param zip
 */
export async function addLicense(zip) {
  console.log('including LICENSE');
  const str = fs.createReadStream('LICENSE');
  zip.file('LICENSE', str)
}


/**
 * Add scrips/config.js.
 * @param zip
 */
export async function addConfig(zip) {
  console.log('generating scripts/config.js');
  const str = makeConfigScript(runtimeConfigTable);
  zip.file('scripts/config.js', str);
}


/**
 * Add manifest.json.
 * @param zip
 */
export async function addManifest(zip) {
  console.log('generating manifest.json');
  const str = stringifyManifest(genManifest());
  zip.file('manifest.json', str);
}


/**
 * Add files from BP/ folder.
 * @param zip
 */
export async function addBP(zip) {
  return addDirToZip(zip, config.staticSrc);
}


/**
 * Add files from dist/js-out/ to scripts/.
 * @param zip
 */
export async function addJSOut(zip) {
  const jsOut = path.join(config.distDir, 'js-out');
  return addDirToZip(zip.folder('scripts'), jsOut);
}


/**
 * Create dist package.
 */
export async function createDist() {
  const zip = new JSZip();
  await Promise.all([
    addLicense(zip),
    addConfig(zip),
    addManifest(zip),
    addBP(zip),
    addJSOut(zip),
  ]);

  if (!fs.statSync(config.distDir)?.isDirectory())
    await fsp.mkdir(config.distDir);

  const outFilePath = path.join(config.distDir,
      formatString(config.outFileFmt, runtimeConfigTable));

  await writeZip(zip, outFilePath);
}


/**
 * Clean-up generated files. Note: does not include the dist files.
 */
export async function cleanUp() {
  await fsp.rm(path.join(config.distDir, 'js-out'), {
    recursive: true,
    force: true,
  });
}
