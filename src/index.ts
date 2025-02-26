/*============================================================================*\
+*
+* This is the core of the debug stick add-on for Minecraft: Bedrock Edition
+*
+* Official links:
+* MCPEDL: https://mcpedl.com/debug-stick
+* GitHub: https://github.com/vytdev/debug-stick
+*
+* Script last updated: September 19, 2024
+*
+* Copyright (c) 2023-2025 VYT <https://vytdev.github.io>
+* This project is licensed under the MIT License.
+* See LICENSE for more details.
+*
\*============================================================================*/

import {
  Player,
  Block,
  BlockStates,
  ItemStack,
  world,
  system,
  LiquidType
} from "@minecraft/server";

import {
  BlockStateSuperset
} from "@minecraft/vanilla-data";

/**
 * Block state type
 */
type BlockStateValue = boolean | number | string;

/**
 * The item identifier of the debug stick
 */
const DEBUG_STICK_ID = "vyt:debug_stick";


// Some event listeners. Listens for entityHitBkock
// and itemUseOn events, which triggers an action onto
// the debug stick
world.afterEvents.entityHitBlock.subscribe((ev) => {
  if (ev.damagingEntity.typeId != "minecraft:player")
    return;

  const player = getPlayerByID(ev.damagingEntity.id);

  if (player == undefined || !isHoldingDebugStick(player))
    return;

  safeCall(changeSelectedProperty, player, ev.hitBlock);
});

world.beforeEvents.itemUseOn.subscribe((ev) => {
  if (ev.source.typeId != "minecraft:player")
    return;
  if (ev.itemStack?.typeId != DEBUG_STICK_ID)
    return;

  ev.cancel = true;

  const player = getPlayerByID(ev.source.id);

  if (player == undefined) return;

  if (player.isSneaking)
    safeCall(displayBlockInfo, player, ev.block);
  else
    safeCall(updateBlockProperty, player, ev.block);
});

// Players should not be able to break blocks using
// the debug stick in survival
//
// TODO: explore other alternatives
world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  if (ev.itemStack?.typeId != DEBUG_STICK_ID)
    return;
  ev.cancel = true;
})


/*============================================================================*\
+* Action functions
\*============================================================================*/

/**
 * Change the selected property
 * @param player
 * @param block
 */
function changeSelectedProperty(player: Player, block: Block) {
  const permutation = block.permutation;
  const states = permutation.getAllStates();
  const names = Object.keys(states);

  if (!names.length && !block.canContainLiquid(LiquidType.Water))
    return message(`${block.typeId} has no properties`, player);

  let prop = getCurrentProperty(player, block.typeId);

  if (prop == undefined) return;

  let val: BlockStateValue;

  // Increment for the next property
  prop = names[names.indexOf(prop) + 1];
  val = states[prop];

  // We're probably at the end of the property names
  // list, check if the 'waterlogged' property is
  // available, or just go back at the start of the list
  if (!prop) {
    if (block.canContainLiquid(LiquidType.Water)) {
      prop = "waterlogged";
      val = block.isWaterlogged;
    }
    else {
      prop = names[0];
      val = states[prop];
    }
  }

  // Update the player's selection
  setCurrentProperty(player, block.typeId, prop);

  message(`selected "${prop}" (${val})`, player);
}

/**
 * Change a block property value
 * @param player
 * @param block
 */
function updateBlockProperty(player: Player, block: Block) {
  const permutation = block.permutation;
  const states = permutation.getAllStates();
  const names = Object.keys(states);

  if (!names.length && !block.canContainLiquid(LiquidType.Water))
    return message(`${block.typeId} has no properties`, player);

  let prop = getCurrentProperty(player, block.typeId);

  if (prop == undefined) return;

  let val: BlockStateValue;

  // Ensure that the recorded block property selection
  // is available on the block
  if (prop == "waterlogged" ? !block.canContainLiquid(LiquidType.Water) : !names.includes(prop))
    prop = names[0];

  if (!prop && block.canContainLiquid(LiquidType.Water))
    prop = "waterlogged";

  // Update the property value
  if (prop == "waterlogged") {
    val = !block.isWaterlogged;
    system.run(() => {
      block.setWaterlogged(val as boolean);
    });
  }

  else {
    const valids = BlockStates.get(prop)!.validValues;
    val = valids[valids.indexOf(states[prop]) + 1];

    if (typeof val === "undefined")
      val = valids[0];

    system.run(() => {
      block.setPermutation(permutation.withState(prop as keyof BlockStateSuperset, val));
    });
  }

  // Avoid some edge cases bugs
  setCurrentProperty(player, block.typeId, prop);

  message(`"${prop}" to ${val}`, player);
}

/**
 * The block viewer feature
 * @param player
 * @param block
 */
function displayBlockInfo(player: Player, block: Block) {
  let info = "§l§b" + block.typeId + "§r";

  // The block's coordinates
  info += "\n§4" + block.x + " §a" + block.y + " §9" + block.z;

  // Block's matter state
  info += "\n§7matter state§8: §e";
  if (block.isLiquid) info += "liquid";
  else if (block.isAir) info += "gas";
  else info += "solid";

  // Whether the block is impassable
  info += "\n§7hard block§8: " + (block.isSolid ? "§ayes" : "§cno");

  // The block's emitted/recieved redstone power
  info += "\n§7redstone power§8: §c" + (block.getRedstonePower() ?? 0);

  // The block states
  Object.entries(block.permutation.getAllStates()).forEach(([k, v]) => {
    info += "\n§o§7" + k + "§r§8: ";
    if (typeof v == "string") info += "§e";
    if (typeof v == "number") info += "§3";
    if (typeof v == "boolean") info += "§6";
    info += v;
  });

  // Waterlog property if available
  if (block.canContainLiquid(LiquidType.Water))
    info += "\n§o§7waterlogged§r§8: §6" + block.isWaterlogged;

  // Additional block tags
  block.getTags().forEach(v => info += "\n§d#" + v);

  message(info, player);
}


/*============================================================================*\
+* Utility functions
\*============================================================================*/

const record: Record<string, Record<string, string>> = {};

/**
 * Message a player into their actionbar
 * @param msg The message
 * @param player The player to message
 */
function message(msg: string, player: Player) {
  return player
    .runCommandAsync(
      `titleraw @s actionbar {"rawtext":[{"text":${JSON.stringify(msg)}}]}`
    );
}

/**
 * Returns a player's currently held item
 * @param player The player
 * @returns ItemStack or undefined
 */
function getHeldItem(player: Player): ItemStack | undefined {
  return player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
}

/**
 * Queries whether a player is currently using the debug
 * stick item
 * @param player The player
 * @returns true if the player currently holds the debug
 * stick
 */
function isHoldingDebugStick(player: Player): boolean {
  return getHeldItem(player)
    ?.typeId == DEBUG_STICK_ID;
}

/**
 * Utility function to return a player class from an entity ID
 * @param id The entity ID
 * @returns Player instance or undefined
 */
function getPlayerByID(id: string): Player | undefined {
  return world
    .getAllPlayers()
    .find(v => v.id == id);
}

/**
 * Get the currently selected property for a block given the
 * interacting player
 * @param player The player
 * @param block The block ID
 * @returns The current selected property or undefined
 */
function getCurrentProperty(player: Player, block: string): string | undefined {
  if (!(player.id in record))
    record[player.id] = {};
  return record[player.id][block];
}

/**
 * Change the currently selected property for a block given
 * the interacting player
 * @param player The player
 * @param block The block ID
 * @param val The new property name
 */
function setCurrentProperty(player: Player, block: string, val: string): void {
  if (!(player.id in record))
    record[player.id] = {};
  record[player.id][block] = val;
}

/**
 * Safely call a function. Catch errors into content log
 * @param func The function
 * @param args Arguments of the function
 * @returns Whatever that function will return
 */
function safeCall<A extends any[], R>(
    func: (...args: A) => R,
    ...args: A
  ): R | undefined {

    try {
      return func.apply({}, args);
    }
    catch (e) {
      let msg = "DEBUG STICK ERROR\n";
      msg    += "Please report this issue on GitHub:\n";
      msg    += "  https://github.com/vytdev/debug-stick/issues/new\n";
      msg    += "\n";

      msg += e;

      if (e instanceof Error && e.stack)
        msg += `\n${e.stack}`;

      console.error(msg);
    }
    return undefined;
}
