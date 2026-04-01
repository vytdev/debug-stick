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
 * Open the Debug Stick UI form.
 * @param player The player to open the UI for.
 * @param block The working block.
 */
export function openUI(player: Player, block: Block) {
  message('Not yet implemented.', player);
}
