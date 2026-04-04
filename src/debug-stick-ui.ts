/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { DebugStickContext, PropName, PropValue } from './context.js';
import { defer, safeCall } from './utils.js';
import config from './config.js';
import { ModalFormData } from '@minecraft/server-ui';

import {
  PlayerInteractWithBlockBeforeEvent,
  world,
} from '@minecraft/server';


/**
 * Debug stick UI's item identifier.
 */
export const DEBUG_STICK_UI_ID = 'vyt:debug_stick_ui';


/**
 * Opens the debug-stick UI.
 * @param ctx
 */
export function openUI(ctx:
        DebugStickContext<PlayerInteractWithBlockBeforeEvent>)
{
  const form = new ModalFormData();

  form.title('§6Debug Stick UI§r');
  form.label(
    '§7This is an experimental feature.\n' +
    `Debug Stick v${config.version} (${config.shCommit})§r\n` +
    '\n' +
    `Modifying properties of block: §b§l${ctx.block.typeId}§r`
  );

  // The label above is result[0].
  const VAL_START_INDEX = 1;

  const currProps = ctx.getAllProps();
  const propNames = Object.keys(currProps);

  if (!propNames.length) {
    form.label('§eBlock has no properties.§r');
    form.submitButton('Abort');
    return form.show(ctx.player);
  }

  const propVals: Record<PropName, PropValue[]> = {};

  // create the dropdowns
  for (const prop of propNames) {
    const validVals = DebugStickContext.getPropValidValues(prop);
    form.dropdown(prop, validVals.map(String), {
      defaultValueIndex: validVals.indexOf(currProps[prop])
    });
    propVals[prop] = validVals;
  }

  form.label('You can click the §cX§r button or press §cEsc§r to abort.');
  form.submitButton('Apply Changes');

  form.show(ctx.player).then(resp => {
    if (resp.canceled)
      return;
    for (let i = 0; i < propNames.length; i++) {
      const prop = propNames[i];
      const selIdx = resp.formValues[i + VAL_START_INDEX] as number;
      const newVal = propVals[prop][selIdx];
      if (currProps[prop] == newVal)
        continue;
      ctx.setBlockProp(prop, newVal);
    }
  });
}


let isEnabled = false;
let blockInteractListener: any;


/**
 * Registers event listeners for vyt:debug_stick.
 */
export function enableDebugStickUI() {
  if (isEnabled)
    return;
  isEnabled = true;

  // Short tap/click triggers.
  blockInteractListener = world.beforeEvents
      .playerInteractWithBlock.subscribe(ev =>
  {
    if (ev.itemStack?.typeId != DEBUG_STICK_UI_ID)
      return;
    ev.cancel = true;
    const ctx = new DebugStickContext(ev.block, ev.player, ev);
    defer(() => {
      let isError, result;
      [isError, result] = safeCall(openUI, ctx);
      if (isError)
        ev.player.sendMessage('§c' + result);
      });
  });
}


/**
 * Deregisters event listeners for vyt:debug_stick.
 */
export function disableDebugStickUI() {
  if (!isEnabled)
    return;
  isEnabled = false;
  world.beforeEvents.playerInteractWithBlock
        .unsubscribe(blockInteractListener);
}
