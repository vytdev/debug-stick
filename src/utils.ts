/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import {
  system
} from '@minecraft/server';

import config from './config.js';


/**
 * Defer the execution of a function.
 * @param func The function to delay.
 * @param args Arguments.
 * @returns Promise with the result of the function.
 */
export function defer<A extends any[], R>(
    func: (...args: A) => R, ...args: A): Promise<R>
{
  return new Promise((res, rej) => {
    system.run(() => {
      try { res(func.apply({}, args)); }
      catch (e) { rej(e); }
    })
  })
}


/**
 * Cycle through an array.
 * @param arr The array.
 * @param curr The current value in the array.
 * @returns Next value.
 */
export function cycleArray<T>(arr: Array<T>, curr: T): T {
  return arr[(arr.indexOf(curr) + 1) % arr.length];
}


/**
 * Safely call a function. Catch errors into content log
 * @param func The function
 * @param args Arguments of the function
 * @returns [isError, result]
 */
export function safeCall<A extends any[], R>(
    func: (...args: A) => R, ...args: A): [false, R] | [true, string]
{
  try {
    return [false, func.apply({}, args)];
  }
  catch (e) {
    let msg = 'DEBUG STICK ERROR\n';
    msg    += 'Please report this issue on GitHub:\n';
    msg    += '  https://github.com/vytdev/debug-stick/issues/new\n';
    msg    += '\n';
    msg    += 'add-on version: '        + config.version + '\n',
    msg    += '@minecraft/server: '     + config.apiVer + '\n';
    msg    += '@minecraft/server-ui: '  + config.uiApiVer + '\n';
    msg    += 'min_engine_version: '    + config.minMcVer + '\n';
    msg    += 'branch: '                + config.branch + '\n';
    msg    += 'commit: '                + config.shCommit + '\n';
    msg    += '\n';

    msg += e;

    if (e instanceof Error && e?.stack)
      msg += `\n${e.stack}`;

    console.error(msg);
    return [true, msg];
  }
}
