import child_process from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';


/**
 * Format string with '{key}' substitution.
 * @param template The template, with optional '{key}'.
 * @param subTab The substitution table.
 * @returns The string.
 */
export function formatString(template, subTab) {
  return template.replace(/\{([\w$_]+)\}/g, (old, arg) =>
    (subTab[arg] ?? old));
}


/**
 * Asynchronously run a sub-process.
 * @param arg0 Name of or path to the executable.
 * @param args Arguments to pass to the process.
 * @returns A Promise.
 */
export async function runProcessAsync(arg0, ...args) {
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
 * Adds a directory into the given zip object.
 * @param zipObj The zip object.
 * @param folder The folder to zip.
 */
export async function addDirToZip(zipObj, folder) {
  const items = await fsp.readdir(folder);

  const addItem = async (item) => {
    const fullPath = path.join(folder, item);
    console.log('adding ' + fullPath);          // feedback
    const stat = await fsp.stat(fullPath);
    if (stat.isDirectory()) {
      const subFolder = zipObj.folder(item);
      await addDirToZip(subFolder, fullPath);
    } else {
      zipObj.file(item, fs.createReadStream(fullPath));
    }
  };

  await Promise.all(items.map(addItem));
}


/**
 * Write the zip file.
 * @param zipObj The zip object.
 * @param outPath The output path.
 */
export async function writeZip(zipObj, outPath) {
  const output = fs.createWriteStream(outPath);

  zipObj.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
  }).pipe(output);

  return new Promise((resolve, reject) => {
    output.on('finish', resolve);
    output.on('error', reject);
  });
}
