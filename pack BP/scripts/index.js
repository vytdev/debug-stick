/*============================================================================*\

  This is the core of the debug stick add-on for Minecraft: Bedrock Edition.

  Official links:
  - CurseForge: https://www.curseforge.com/minecraft-bedrock/addons/debug-stick
  - MCPEDL: https://mcpedl.com/debug-stick
  - GitHub: https://github.com/vytdev/debug-stick

  Script last updated: July 28, 2025

  Copyright (c) 2023-2025 VYT <https://vytdev.github.io>
  This project is licensed under the MIT License.
  This software is provided "as is" without warranty of any kind.
  See LICENSE for the full terms.

\*============================================================================*/
import { BlockStates, LiquidType, world, system, } from "@minecraft/server";
/**
 * The item identifier of the debug stick
 */
const DEBUG_STICK_ID = "vyt:debug_stick";
/**
 * Message prefix for error handling
 */
const ERROR_MESSAGE_PREFIX = [
    "DEBUG STICK ERROR",
    "Please report this issue on GitHub:",
    "  https://github.com/vytdev/debug-stick/issues/new\n",
].join("\n");
/**
 * Decounce map for interacting event
 */
const interactDebounce = new WeakMap();
world.beforeEvents.playerInteractWithBlock.subscribe(safeCallWrapper((event) => {
    const { itemStack, player, block } = event;
    if (interactDebounce.has(player))
        return;
    if (!itemStack)
        return;
    if (itemStack.typeId !== DEBUG_STICK_ID)
        return;
    event.cancel = true;
    interactDebounce.set(player, true);
    // afterEvent won't fire when we cancel this event
    // So we have to use delays instend
    system.runTimeout(() => {
        interactDebounce.delete(player);
    }, 5);
    if (player.isSneaking) {
        system.run(() => displayBlockInfo(player, block));
        return;
    }
    system.run(() => updateBlockProperty(player, block));
}));
world.beforeEvents.playerBreakBlock.subscribe(safeCallWrapper((event) => {
    const { itemStack, player, block } = event;
    if (!itemStack)
        return;
    if (itemStack.typeId !== DEBUG_STICK_ID)
        return;
    event.cancel = true;
    system.run(() => changeSelectedProperty(player, block));
}));
/*============================================================================*\
  Action functions
\*============================================================================*/
/**
 * Change the selected property
 * @param player
 * @param block
 */
function changeSelectedProperty(player, block) {
    const states = getBlockStates(block);
    const names = Object.keys(states);
    if (names.length === 0) {
        player.onScreenDisplay.setActionBar(`${block.typeId} has no properties`);
        return;
    }
    let property = getCurrentProperty(player, block.typeId);
    let value;
    // Increment for the next property
    property = names[names.indexOf(property) + 1];
    value = states[property];
    // We're probably at the end of the property names
    // list, cycle back from the start.
    if (!property) {
        property = names[0];
        value = states[property];
    }
    setCurrentProperty(player, block.typeId, property);
    player.onScreenDisplay.setActionBar(`selected "${property}" (${value})`);
}
/**
 * Change a block property value
 * @param player
 * @param block
 */
function updateBlockProperty(player, block) {
    const states = getBlockStates(block);
    const names = Object.keys(states);
    if (names.length === 0) {
        player.onScreenDisplay.setActionBar(`${block.typeId} has no properties`);
        return;
    }
    let property = getCurrentProperty(player, block.typeId);
    let newValue;
    // Ensure that the recorded block property selection
    // is available on the block
    if (!names.includes(property))
        property = names[0];
    const valids = getStateValidValues(property);
    const currentValue = states[property];
    // Handle each type separately for more efficent next value search;
    if (typeof currentValue === "number") {
        newValue = (currentValue + 1) % valids.length;
    }
    else if (typeof currentValue === "boolean") {
        newValue = !currentValue;
    }
    else {
        newValue = valids[valids.indexOf(states[property]) + 1];
        if (typeof newValue === "undefined")
            newValue = valids[0];
    }
    setBlockState(block, property, newValue);
    setCurrentProperty(player, block.typeId, property);
    player.onScreenDisplay.setActionBar(`"${property}" to ${newValue}`);
}
/**
 * Block viwer helper
 */
const blockInfoPresets = [
    "§l§b{BLOCK_ID}§r",
    "§4{LOCATION_X} §a{LOCATION_Y} §9{LOCATION_Z}§r",
    "§7Matter State§8: §e{MATTER_STATE}§r",
    "§7Redstone Power§8: §c{REDSTONE_POWER}§r",
].join("\n");
/**
 * Block viwer helper
 */
const propertyTypeColor = {
    string: "§e",
    number: "§3",
    boolean: "§6",
};
/**
 * The block viewer feature
 * @param player
 * @param block
 */
function displayBlockInfo(player, block) {
    const location = block.location;
    //Block Id
    let info = blockInfoPresets.replace("{BLOCK_ID}", block.typeId);
    // ========== Basic info ==========
    //Location
    info = info.replace("{LOCATION_X}", String(location.x));
    info = info.replace("{LOCATION_Y}", String(location.y));
    info = info.replace("{LOCATION_Z}", String(location.z));
    // Matter State
    info = info.replace("{MATTER_STATE}", getBlockMatterState(block));
    // Redstone Power
    const redstone_power = block.getRedstonePower() ?? 0;
    info = info.replace("{REDSTONE_POWER}", String(redstone_power));
    // Seperator
    info += "\n";
    // The block states
    Object.entries(getBlockStates(block)).forEach(([key, value]) => {
        const color = propertyTypeColor[typeof value];
        info += `\n§o§7${key}§r§8: ${color}${value}`;
    });
    // Seperator
    info += "\n";
    // Additional block tags
    block.getTags().forEach((v) => (info += "\n§d#" + v));
    player.onScreenDisplay.setActionBar(info);
}
/*============================================================================*\
  Utility functions
\*============================================================================*/
const currentProperty = new WeakMap();
const blockStatesCache = new WeakMap();
/**
 * Returns all the block states of a block.
 * @param block The block.
 * @returns BlockStatesMap
 */
function getBlockStates(block) {
    if (blockStatesCache.has(block)) {
        return blockStatesCache.get(block);
    }
    const states = block.permutation.getAllStates() || {};
    if (block.canContainLiquid(LiquidType.Water)) {
        states["waterlogged"] = block.isWaterlogged;
    }
    blockStatesCache.set(block, states);
    return states;
}
/**
 * Get the valid values of a block state.
 * @param state The block state.
 * @returns BlockStateValue[]
 */
function getStateValidValues(state) {
    if (state === "waterlogged")
        return [false, true];
    return BlockStates.get(state).validValues;
}
/**
 * Set a block's state.
 * @param block The block to modify.
 * @param state The state property to set.
 * @param value The value to set.
 * @returns Promise
 */
function setBlockState(block, state, value) {
    function setState(resolve, reject) {
        try {
            if (state === "waterlogged") {
                block.setWaterlogged(value);
                return;
            }
            const newStates = block.permutation.withState(state, value);
            block.setPermutation(newStates);
            blockStatesCache.get(block)[state] = value;
            resolve(null);
        }
        catch (error) {
            reject(error);
        }
    }
    return new Promise(setState);
}
/**
 * Get the currently selected property for a block given the
 * interacting player
 * @param player The player
 * @param block The block ID
 * @returns The current selected property or undefined
 */
function getCurrentProperty(player, block) {
    if (!currentProperty.has(player)) {
        currentProperty.set(player, new Map());
        return undefined;
    }
    return currentProperty.get(player).get(block);
}
/**
 * Change the currently selected property for a block given
 * the interacting player
 * @param player The player
 * @param block The block ID
 * @param value The new property name
 */
function setCurrentProperty(player, block, value) {
    if (!currentProperty.has(player)) {
        currentProperty.set(player, new Map());
    }
    currentProperty.get(player).set(block, value);
}
/**
 * Safely call a function. Catch errors into content log
 * @param func The function
 * @param args Arguments of the function
 * @returns Whatever that function will return
 */
function safeCall(func, ...args) {
    try {
        return func.apply({}, args);
    }
    catch (error) {
        let msg = `${ERROR_MESSAGE_PREFIX}${error}`;
        if (error instanceof Error && error?.stack)
            msg += `\n${error.stack}`;
        console.error(msg);
    }
}
/**
 * Safe call wrapper function.
 * @param func The function to wrap
 * @returns A function
 */
function safeCallWrapper(func) {
    return function (...args) {
        return safeCall(func, ...args);
    };
}
/**
 * Block viwer helper
 * @param block
 * @returns Liquid | Gas | Solid
 */
function getBlockMatterState(block) {
    if (block.isLiquid)
        return "Liquid";
    if (block.isAir)
        return "Gas";
    return "Solid";
}
