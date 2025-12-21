/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2025 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import type { BlockType, StateName } from './types';


// TODO: try dynamic properties
const record: Record<string, Record<BlockType, StateName>> = {};

/**
 * @class
 * Manages the selected states of a debug stick item.
 */
export class DebugStateSelections {

  /**
   * @constructor
   * Creates a new DebugStateSelections instance.
   * @param id The persistence ID.
   */
  constructor(id: string) {
    this.id = id;
    this._selections = record[id] ?? (record[id] = {});
  }

  /**
   * @readonly
   * The persistence ID.
   */
  readonly id: string;

  /**
   * @private
   * A table of selected block states.
   */
  private _selections: Record<BlockType, StateName>;


  /**
   * Get the currently selected state of the debug stick tool for the given
   * block type.
   * @param blockType The block type identifier.
   * @returns The selected state or null if not yet set.
   */
  getSelectedStateForBlock(blockType: BlockType): StateName | null {
    return this._selections[blockType] ?? null;
  }


  /**
   * Set the currently selected state of the debug stick tool for the given
   * block type.
   * @param blockType The block type identifier.
   * @param stateName The name of the block state to be set as selected.
   */
  setSelectedStateForBlock(blockType: BlockType, stateName: StateName): void {
    this._selections[blockType] = stateName;
  }
}
