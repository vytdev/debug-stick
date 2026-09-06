/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { cycleArray, defer, safeCall } from './utils.js';
import { DebugStickContext } from './context.js';

import {
  getAllProps,
  getPropValidValues,
  setBlockProp,
} from './helpers.js';

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
  const props = getAllProps(ctx.block);
  const propNames = Object.keys(props);
  if (!propNames.length)
    return ctx.notify(`${ctx.block.typeId} has no properties`);

  // Cycle through all property names.
  let currProp = ctx.sels.getForBlock(ctx.block.typeId);
  currProp = cycleArray(propNames, currProp);
  ctx.sels.setForBlock(ctx.block.typeId, currProp);

  ctx.notify(`selected "${currProp}" (${props[currProp]})`);
}


/**
 * Cycle the state value of the selected state on a block.
 * @param ctx
 */
export function updateBlockProperty(ctx:
          DebugStickContext<PlayerInteractWithBlockBeforeEvent>)
{
  const props = getAllProps(ctx.block);
  const propNames = Object.keys(props);
  if (!propNames.length)
    return ctx.notify(`${ctx.block.typeId} has no properties`);

  // Get the currenty selected property.
  const currProp = ctx.sels.getForBlock(ctx.block.typeId) ?? propNames[0];

  // Cycle through property values.
  const validVals = getPropValidValues(currProp);
  const newVal = cycleArray(validVals, props[currProp]);

  setBlockProp(ctx.block, currProp, newVal);
  ctx.notify(`"${currProp}" to ${newVal}`);
}


/**
 * Create block viewer text.
 * @param ctx
 * @returns The text.
 */
export function genBlockViewerText<K>(ctx: DebugStickContext<K>)
{
  const block = ctx.block;
  let info = '§l§b' + block.typeId + '§r';

  // Basic block info.
  // e.g.,
  //   -123 60 456
  //   redstone power: 0
  info += '\n§4' + block.x + ' §a' + block.y + ' §9' + block.z;
  info += '\n§o§7redstone power§r§8: §c' + (block.getRedstonePower() ?? 0);

  // Get current property selection on block
  // to we can give it a mark.
  const currSel = ctx.sels.getForBlock(ctx.block.typeId);

  // The set block states.
  // e.g.,
  //   cardinal_direction: north
  //   waterlogged: false *
  for (const [prop, value] of Object.entries(getAllProps(ctx.block))) {
    info += '\n§7' + prop + '§r§8: ';
    switch (typeof value) {
      case 'string':  info += '§e'; break;
      case 'number':  info += '§3'; break;
      case 'boolean': info += '§6'; break;
      default:        info += '§8';
    }
    info += value;
    if (currSel == prop)
      info += ' §c*';
  };

  // Additional block tags
  // e.g.,
  //   #wood
  block.getTags().forEach(v => info += '\n§d#' + v);
  return info;
}


/**
 * Display block info to player's action bar.
 * @param ctx
 */
export function displayBlockInfo(ctx:
            DebugStickContext<PlayerInteractWithBlockBeforeEvent>)
{
  const info = genBlockViewerText(ctx);
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
      if (ev.player.isSneaking)   // show block viewer
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
