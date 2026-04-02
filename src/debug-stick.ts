/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { DebugPropertySelections } from './selection.js';
import { DebugStickContext } from './context.js';
import { cycleArray, defer, safeCall } from './utils.js';

import {
  PlayerBreakBlockBeforeEvent,
  PlayerInteractWithBlockBeforeEvent,
  world,
} from '@minecraft/server';


/**
 * The debug stick's item identifier.
 */
export const DEBUG_STICK_ID = 'vyt:debug_stick';


/**
 * Change the selected block state.
 * @param ctx
 */
export function changeSelectedProperty(ctx:
        DebugStickContext<PlayerBreakBlockBeforeEvent>)
{
  const props = ctx.getAllProps();
  const propNames = Object.keys(props);
  if (!propNames.length)
    return ctx.notify(`${ctx.block.typeId} has no properties`);

  // Cycle through all property names.
  const sels = new DebugPropertySelections(ctx.player.id);
  let currProp = sels.getForBlock(ctx.block.typeId);
  currProp = cycleArray(propNames, currProp);
  sels.setForBlock(ctx.block.typeId, currProp);

  ctx.notify(`selected "${currProp}" (${props[currProp]})`);
}


/**
 * Cycle the state value of the selected state on a block.
 * @param ctx
 */
export function updateBlockProperty(ctx:
          DebugStickContext<PlayerInteractWithBlockBeforeEvent>)
{
  const props = ctx.getAllProps();
  const propNames = Object.keys(props);
  if (!propNames.length)
    return ctx.notify(`${ctx.block.typeId} has no properties`);

  // Get the currenty selected property.
  const sels = new DebugPropertySelections(ctx.player.id);
  const currProp = sels.getForBlock(ctx.block.typeId) ?? propNames[0];

  // Cycle through property values.
  const validVals = DebugStickContext.getPropValidValues(currProp);
  const newVal = cycleArray(validVals, props[currProp]);

  ctx.setBlockProp(currProp, newVal);
  ctx.notify(`"${currProp}" to ${newVal}`);
}


/**
 * The block viewer feature
 * @param ctx
 */
export function displayBlockInfo(ctx:
            DebugStickContext<PlayerInteractWithBlockBeforeEvent>)
{
  const block = ctx.block;
  let info = '§l§b' + block.typeId + '§r';

  // Basic block info.
  info += '\n§4' + block.x + ' §a' + block.y + ' §9' + block.z;
  info += '\n§o§7redstone power§r§8: §c' + (block.getRedstonePower() ?? 0);

  // The set block states.
  for (const [prop, value] of Object.entries(ctx.getAllProps())) {
    info += '\n§7' + prop + '§r§8: ';
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

  ctx.notify(info);
}


// Java behaviour:
// - left-click = select property
// - right-click = change state value
// - shift + (left-or-right-)click = cycle in reverse

// This behaviour:
// - left-click = select property
// - right-click = change state value
// - shift + right-click = block viewer



let isEnabled = false 
let blockInteractListener: any;
let breakBlockListener: any;


/**
 * Registers event listeners for vyt:debug_stick.
 */
export function enableDebugStick() {
  if (isEnabled)
    return;
  isEnabled = true;

  // Short tap/click triggers.
  blockInteractListener = world.beforeEvents
      .playerInteractWithBlock.subscribe(ev =>
  {
    if (ev.itemStack?.typeId != DEBUG_STICK_ID)
      return;
    ev.cancel = true;
    const ctx = new DebugStickContext(ev.block, ev.player, ev);
    defer(() => {
      let isError, result;
      if (ev.player.isSneaking)
        [isError, result] = safeCall(displayBlockInfo, ctx);
      else
        [isError, result] = safeCall(updateBlockProperty, ctx);
      if (isError)
        ev.player.sendMessage('§c' + result);
      });
  });

  // Long press/block break triggers.
  breakBlockListener = world.beforeEvents
      .playerBreakBlock.subscribe(ev =>
  {
    if (ev.itemStack?.typeId != DEBUG_STICK_ID)
      return;
    ev.cancel = true;
    const ctx = new DebugStickContext(ev.block, ev.player, ev);
    defer(() => {
      let [isError, result] = safeCall(changeSelectedProperty, ctx);
      if (isError)
        ev.player.sendMessage('§c' + result);
    });
  });
}


/**
 * Deregisters event listeners for vyt:debug_stick.
 */
export function disableDebugStick() {
  if (!isEnabled)
    return;
  isEnabled = false;
  world.beforeEvents.playerInteractWithBlock
        .unsubscribe(blockInteractListener);
  world.beforeEvents.playerBreakBlock
        .unsubscribe(breakBlockListener);
}
