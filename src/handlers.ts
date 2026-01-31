/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { Block, Player } from '@minecraft/server';
import { message } from './utils.js';
import { getStatesOfBlock, getStateValidValues, setBlockState
    } from './state.js';
import { DebugStateSelections } from './selection.js';


/**
 * Change the selected block state.
 * @param player The player who initiated the change.
 * @param block The block the player is working with.
 * @param item The debug stick item used.
 */
export function changeSelectedProperty(player: Player, block: Block) {
  const states = getStatesOfBlock(block);
  const stateNames = Object.keys(states);
  if (!stateNames.length)
    return message(`${block.typeId} has no properties`, player);

  // Cycle through the possible states.
  const selections = new DebugStateSelections(player.id);
  let currState = selections.getSelectedStateForBlock(block.typeId);
  currState = stateNames[(stateNames.indexOf(currState) + 1)
      % stateNames.length];
  selections.setSelectedStateForBlock(block.typeId, currState);

  message(`selected "${currState}" (${states[currState]})`, player);
}


/**
 * Cycle the state value of the selected state on a block.
 * @param player The player who initiated the cycle.
 * @param block The block to update with the debug stick.
 * @param item The debug stick item used.
 */
export function updateBlockProperty(player: Player, block: Block) {
  const states = getStatesOfBlock(block);
  const stateNames = Object.keys(states);
  if (!stateNames.length)
    return message(`${block.typeId} has no properties`, player);

  // Get the currently selected state.
  const selections = new DebugStateSelections(player.id);
  const currState = selections.getSelectedStateForBlock(block.typeId)
      ?? stateNames[0];

  // Cycle through valid state values.
  const valids = getStateValidValues(currState);
  const value = valids[(valids.indexOf(states[currState]) + 1) % valids.length];

  setBlockState(block, currState, value)
    .then(() => message(`"${currState}" to ${value}`, player));
}


/**
 * The block viewer feature
 * @param player
 * @param block
 */
export function displayBlockInfo(player: Player, block: Block) {
  let info = '§l§b' + block.typeId + '§r';

  // Basic block info.
  info += '\n§4' + block.x + ' §a' + block.y + ' §9' + block.z;
  info += '\n§o§7redstone power§r§8: §c' + (block.getRedstonePower() ?? 0);

  // The set block states.
  for (const [stateName, value] of Object.entries(getStatesOfBlock(block))) {
    info += '\n§7' + stateName + '§r§8: ';
    switch (typeof value) {
      case 'string':  info += '§e'; break;
      case 'number':  info += '§3'; break;
      case 'boolean': info += '§6'; break;
      default:        info += '§8';
    }
    info += value;
  };

  // Additional block tags.
  block.getTags().forEach(v => info += '\n§d#' + v);

  message(info, player);
}
