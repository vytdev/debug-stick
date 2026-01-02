/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { Player, system } from '@minecraft/server';


/**
 * Message a player into their actionbar
 * @param msg The message
 * @param player The player to message
 */
export async function message(msg: string, player: Player) {
  return new Promise((res, rej) => {
    system.run(() => {
      try {
        res(player.onScreenDisplay.setActionBar(msg));
      }
      catch (e) {
        rej(e);
      }
    });
  });
}


/**
 * Safely call a function. Catch errors into content log
 * @param func The function
 * @param args Arguments of the function
 * @returns Whatever that function will return
 */
export function safeCall<A extends any[], R>(
    func: (...args: A) => R, ...args: A): R | undefined {
  try {
    return func.apply({}, args);
  }
  catch (e) {
    let msg = 'DEBUG STICK ERROR\n';
    msg    += 'Please report this issue on GitHub:\n';
    msg    += '  https://github.com/vytdev/debug-stick/issues/new\n';
    msg    += '\n';

    msg += e;

    if (e instanceof Error && e?.stack)
      msg += `\n${e.stack}`;

    console.error(msg);
  }
}


/**
 * Safe call wrapper function.
 * @param func The function to wrap
 * @returns A function
 */
export function safeCallWrapper<A extends any[], R>(
    func: (...args: A) => R): ((...args: A) => R | undefined) {
  return function (...args: A): R | undefined {
    return safeCall(func, ...args);
  }
}
