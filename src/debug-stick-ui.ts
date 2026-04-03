/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import {
  BlockPermutation,
  PlayerInteractWithBlockBeforeEvent,
  system,
  world,
} from '@minecraft/server';

import {
  ModalFormData,
} from '@minecraft/server-ui';

import {
  DebugStickContext,
  PropName,
  PropValue,
} from './context.js';
import { defer, safeCall } from './utils.js';

import config from './config.js';


export const DEBUG_STICK_UI_ID = 'vyt:debug_stick_ui';


// TODO: clean all of these

/**
 * Open the Debug Stick UI form.
 * @param ctx
 */
export function openUI(ctx: DebugStickContext<PlayerInteractWithBlockBeforeEvent>): void
{
  const typeId = ctx.block.typeId;
  const currStates = ctx.getAllProps();
  const stateNameList = Object.keys(currStates);
  const form = new ModalFormData();

  form.title('§6Debug Stick UI§r');
  form.label('This is an experimental feature.\n' +
             'Debug Stick v' + config.version);
  form.label(`Modifying states of block: §l§b${typeId}§r`);

  for (const stateName of stateNameList) {
    addStateToForm(form, stateName, currStates[stateName]);
  }

  form.label('You can click the §cX§r button or press §cEsc§r ' +
             'if you wish to cancel this operation.');
  form.submitButton('Apply Changes');

  system.run(() => {
    form.show(ctx.player).then(r => {
      if (r.canceled || !r.formValues) return;
      const newStateObj: any = {};

      let i = 0;
      for (const stateName of stateNameList) {
        const validVals = DebugStickContext.getPropValidValues(stateName);
        const selVal = validVals[r.formValues[i++ + 2] as number];
        // BUG:
        //
        // in some cases where there are two property names referring to
        // the same thing, like 'cardinal_direction' and 'direction' on doors,
        // if you set one property but leave the other one unchanged,
        // whether BlockPermutation.resolve will choose the correct changed
        // property is undefined. internally, BlockPermutation.resolve might be
        // preferring the most-recently set key, or the last key letter
        // on the alphabet, but we dont know that since it's not documented.
        //
        // we also can't just blindly rely on this, as what if the player
        // changed a property but reverted it back to the previous value.
        // ideally, we must prefer the last property that the player has set,
        // but unfortunately it's not doable. though checking whether the property
        // differs from the current one has to be the most natural workaround.
        //
        if (selVal != currStates[stateName])
          newStateObj[stateName] = selVal;
      }

      delete newStateObj['waterlogged'];  // temporary
      ctx.block.setPermutation(BlockPermutation.resolve(typeId, newStateObj));

      // DEBUG
      ctx.message(JSON.stringify(newStateObj));
    })
  });
}


export function addStateToForm(form: ModalFormData, stateName: PropName,
                               currValue: PropValue): void
{
  const validVals = DebugStickContext.getPropValidValues(stateName);
  form.dropdown(stateName, validVals.map(String), {
    defaultValueIndex: validVals.indexOf(currValue),
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
