/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import {
  Block,
  BlockPermutation,
  BlockStates,
  LiquidType,
  Player,
  RawMessage
} from '@minecraft/server';

import {
  BlockStateSuperset
} from '@minecraft/vanilla-data';

// NOTE: For Java parity, we have to specially handle the 'waterlogged'
// property since it doesn't exist as a block state.


/**
 * @type
 * Block type identifier.
 */
export type BlockType = string;

/**
 * @type
 * Block property name.
 */
export type PropName = string;

/**
 * @type
 * Block property value.
 */
export type PropValue = string | number | boolean;

/**
 * @type
 * Map of property names and values.
 */
export type PropMap = Record<PropName, PropValue>;



/**
 * @class DebugStickContext
 * Context passed to the debug-stick-related event handlers.
 */
export class DebugStickContext<T> {

  /**
   * Creates a new {@link DebugStickContext} instance.
   * @param block The block you'll be working on.
   * @param player The player who initiated the event.
   * @param event The corresponding event that triggered the callback.
   */
  constructor(block: Block, player: Player, event: T) {
    this.block = block;
    this.player = player;
    this.event = event;
  }

  /**
   * The block we're working on.
   */
  readonly block: Block;

  /**
   * The player who initiated the event.
   */
  readonly player: Player;

  /**
   * The event.
   */
  readonly event: T;


  /**
   * Returns an array of valid property values for the given property.
   * @param prop The property name.
   * @returns Valid prop values.
   */
  static getPropValidValues(prop: PropName): PropValue[] {
    if (prop === 'waterlogged')
      return [false, true];
    return BlockStates.get(prop).validValues;
  }


  /**
   * Returns all the properties of a block.
   * @returns Record<PropName, PropValue>
   */
  getAllProps(): PropMap {
    const props = this.block.permutation.getAllStates() || {};
    if (this.block.canContainLiquid(LiquidType.Water))
      props['waterlogged'] = this.block.isWaterlogged;
    return props;
  }


  /**
   * Updates a block's property.
   * Note: Can't work in read-only mode; defer execution.
   * @param prop The property to change.
   * @param value The value to set.
   */
  setBlockProp(prop: PropName, value: PropValue): void {
    if (prop == 'waterlogged')
      this.block.setWaterlogged(value as boolean);
    else
      this.block.setPermutation(this.block.permutation.withState(
          prop as keyof BlockStateSuperset, value));
  }


  /**
   * Sets all the properties of a block.
   * Note: Can't work in read-only mode; defer execution.
   * @param propMap Map of property values.
   */
  setProps(propMap: PropMap): void {
    const stateMap: PropMap = {};      // really BlockStateSuperset
    // BlockPermutation.resolve() does not tolerate unknown state names
    for (const propName in propMap)
      if (propName != 'waterlogged')
        stateMap[propName] = propMap[propName];
    // set .isWaterlogged separately
    if ('waterlogged' in propMap)
      this.block.setWaterlogged(propMap['waterlogged'] as boolean);
    this.block.setPermutation(
        BlockPermutation.resolve(this.block.typeId, propMap));
  }


  /**
   * Sends a message to player's actionbar.
   * Note: Can't work in read-only mode; defer execution.
   * @param msg The message.
   */
  notify(msg: (RawMessage | string)[] | RawMessage | string): void {
    this.player.onScreenDisplay.setActionBar(msg);
  }


  /**
   * Sends a message to player's chat screen.
   * @param msg The message.
   */
  message(msg: (RawMessage | string)[] | RawMessage | string): void {
    this.player.sendMessage(msg);
  }
}
