/*!
 * Debug Stick -- A Bedrock port of the debug stick tool from Java Edition.
 * Copyright (c) 2023-2026 Vincent Yanzee J. Tan <https://vytdev.github.io>
 *
 * This project is licensed under the MIT License.
 * This software is provided "as is" without warranty of any kind.
 * See LICENSE for the full terms.
 */

import {
  BlockType,
  PropName
} from './context.js';


// TODO: try dynamic properties
const record: Record<string, Record<BlockType, PropName>> = {};

/**
 * @class
 * Manages the selected properties of a debug stick item.
 */
export class DebugPropertySelections {

  /**
   * @constructor
   * Creates a new {@link DebugPropertySelections} instance.
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
   * A table of selected block properties.
   */
  private _selections: Record<BlockType, PropName>;


  /**
   * Get the currently selected prop of the debug stick tool for the given
   * block type.
   * @param blockType The block type identifier.
   * @returns The selected prop or null if not yet set.
   */
  getForBlock(blockType: BlockType): PropName | null {
    return this._selections[blockType] ?? null;
  }


  /**
   * Set the currently selected prop of the debug stick tool for the given
   * block type.
   * @param blockType The block type identifier.
   * @param prop The name of the property to be set as selected.
   */
  setForBlock(blockType: BlockType, prop: PropName): void {
    this._selections[blockType] = prop;
  }
}
