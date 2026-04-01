/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { world } from '@minecraft/server';
import { safeCallWrapper } from './utils.js';
import { changeSelectedProperty, displayBlockInfo, updateBlockProperty
    } from './handlers.js';
import { openUI } from './ui-handlers.js';

/**
 * The item identifier of debug stick.
 */
const DEBUG_STICK_ID = 'vyt:debug_stick';
const DEBUG_STICK_UI_ID = 'vyt:debug_stick_ui';

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
  if (ev.itemStack?.typeId == DEBUG_STICK_ID) {
    ev.cancel = true;
    if (ev.player.isSneaking)
      displayBlockInfo(ev.player, ev.block);
    else
      updateBlockProperty(ev.player, ev.block);
  }
  else if (ev.itemStack?.typeId == DEBUG_STICK_UI_ID) {
    ev.cancel = true;
    openUI(ev.player, ev.block);
  }
}));


// Long press/block break triggers.
world.beforeEvents.playerBreakBlock.subscribe(safeCallWrapper((ev) => {
  if (ev.itemStack?.typeId == DEBUG_STICK_ID) {
    ev.cancel = true;
    changeSelectedProperty(ev.player, ev.block);
  }
}));
