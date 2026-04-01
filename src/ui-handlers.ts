/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { Block, BlockPermutation, Player, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { message } from './utils.js';
import { getStatesOfBlock, getStateValidValues } from './state.js';
import type { StateName, StateValue } from './types';


// TODO: clean all of these

/**
 * Open the Debug Stick UI form.
 * @param player The player to open the UI for.
 * @param block The working block.
 */
export function openUI(player: Player, block: Block): void {
  const typeId = block.typeId;
  const currStates = getStatesOfBlock(block);
  const stateNameList = Object.keys(currStates);
  const form = new ModalFormData();

  form.title('§6Debug Stick UI§r');
  form.label('This is an experimental feature.\n' +
             'Debug Stick v26.10.1-beta8');
  form.label(`Modifying states of block: §l§b${typeId}§r`);

  for (const stateName of stateNameList) {
    addStateToForm(form, stateName, currStates[stateName]);
  }

  form.label('You can click the §cX§r button or press §cEsc§r ' +
             'if you wish to cancel this operation.');
  form.submitButton('Apply Changes');

  system.run(() => {
    form.show(player).then(r => {
      if (r.canceled || !r.formValues) return;
      const newStateObj: any = {};

      let i = 0;
      for (const stateName of stateNameList) {
        const validVals = getStateValidValues(stateName);
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
      block.setPermutation(BlockPermutation.resolve(typeId, newStateObj));

      // DEBUG
      message(JSON.stringify(newStateObj), player);
    })
  });
}


export function addStateToForm(form: ModalFormData, stateName: StateName,
                               currValue: StateValue): void
{
  const validVals = getStateValidValues(stateName);
  form.dropdown(stateName, validVals.map(String), {
    defaultValueIndex: validVals.indexOf(currValue),
  });
}
