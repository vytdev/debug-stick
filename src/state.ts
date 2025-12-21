/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2025 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import { Block, BlockStates, LiquidType, system } from '@minecraft/server';
import { BlockStateSuperset } from '@minecraft/vanilla-data';
import type { StateName, StateValue } from './types';

// NOTE: For Java parity, we have to specially handle the 'waterlogged'
// property until it's alright :]


/**
 * Returns an array of valid block state values for the given block state.
 * @param stateName The block state name.
 * @returns Valid block state values.
 */
export function getStateValidValues(stateName: StateName): StateValue[] {
  if (stateName === 'waterlogged')
    return [false, true];
  return BlockStates.get(stateName).validValues;
}


/**
 * Returns all the block states of a block.
 * @param block The block.
 * @returns Record<StateName, StateValue>
 */
export function getStatesOfBlock(block: Block): Record<StateName, StateValue> {
  const states = block.permutation.getAllStates() || {};
  if (block.canContainLiquid(LiquidType.Water))
    states['waterlogged'] = block.isWaterlogged;
  return states;
}


/**
 * Set a block's state.
 * @param block The block to update.
 * @param stateName The name of the state to change.
 * @param value The value to set.
 * @returns Promise
 */
export function setBlockState(block: Block, stateName: StateName,
    value: StateValue): Promise<void> {
  return new Promise((res, rej) => system.run(() => {
    try {
      if (stateName == 'waterlogged')
        block.setWaterlogged(value as boolean);
      else
        block.setPermutation(block.permutation.withState(
            stateName as keyof BlockStateSuperset, value));
      res();
    }
    catch (e) {
      rej(e);
    }
  }));
}
