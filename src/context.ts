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
  Player,
  RawMessage
} from '@minecraft/server';

import { DebugPropertySelections } from './selection.js';


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
    // TODO: item-bound selection data
    this.sels = new DebugPropertySelections(player.id);
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
   * Player selections.
   */
  readonly sels: DebugPropertySelections;


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
