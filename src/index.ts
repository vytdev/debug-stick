/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2025 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { world } from '@minecraft/server';
import { safeCallWrapper } from './utils.js';
import { changeSelectedProperty, displayBlockInfo, updateBlockProperty
    } from './handlers.js';

/**
 * The item identifier of debug stick.
 */
const DEBUG_STICK_ID = 'vyt:debug_stick';

// Java behaviour:
// - left-click = select property
// - right-click = change state value
// - shift + (left-or-right-)click = cycle in reverse

// This behaviour:
// - left-click = select property
// - right-click = change state value
// - shift + right-click = block viewer


// Short tap/click triggers.
world.beforeEvents.playerInteractWithBlock.subscribe(safeCallWrapper((ev) => {
  if (ev.itemStack?.typeId != DEBUG_STICK_ID)
    return;
  ev.cancel = true;
  if (ev.player.isSneaking)
    displayBlockInfo(ev.player, ev.block);
  else
    updateBlockProperty(ev.player, ev.block);
}));


// Long press/block break triggers.
world.beforeEvents.playerBreakBlock.subscribe(safeCallWrapper((ev) => {
  if (ev.itemStack?.typeId != DEBUG_STICK_ID)
    return;
  ev.cancel = true;
  changeSelectedProperty(ev.player, ev.block);
}));
