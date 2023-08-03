/* ================================================================
This piece of file makes it possible for the debug stick to work
================================================================ */

import { BlockStates, world, system } from "@minecraft/server";

const record = {};

function message(msg, player) {
    return player.runCommandAsync(`title @s actionbar ${msg}`);
}

// listen for interaction with blocks
world.afterEvents.entityHitBlock.subscribe((ev) => {
    // check for player
    if (ev.damagingEntity.typeId != "minecraft:player")
        return;
    const player = world.getAllPlayers().find(v => v.id == ev.damagingEntity.id);
    const heldItem = player.getComponent("minecraft:inventory")
        .container.getItem(player.selectedSlot);
    if (heldItem?.typeId != "vyt:debug_stick")
        return;
    // block permutation
    const block = ev.hitBlock;
    const permutation = block.permutation;
    // get next state
    const states = permutation.getAllStates();
    const names = Object.keys(states);
    // check block
    if (!names.length && !block.type.canBeWaterlogged)
        return message(`${block.typeId} has no properties`, player);
    // retrieve state
    let prop = names[names.indexOf(record[player.id]) + 1];
    let val = states[prop];
    // loop through properties
    if (!prop) {
        // waterlogged property available
        if (block.type.canBeWaterlogged) {
            prop = "waterlogged";
            val = block.isWaterlogged;
        }
        // reset to 0
        else {
            prop = names[0];
            val = states[prop];
        }
    }
    // update record
    record[player.id] = prop;
    // send message
    message(`selected "${prop}" (${val})`, player);
});

// listen for clicks in blocks
world.beforeEvents.itemUseOn.subscribe((ev) => {
    // check for player and his held item
    if (ev.source.typeId != "minecraft:player" || ev.itemStack?.typeId != "vyt:debug_stick")
        return;
    // cancel event behaviour
    ev.cancel = true;
    const player = world.getAllPlayers().find(v => v.id == ev.source.id);
    // block permutation
    const block = ev.block;
    const permutation = block.permutation;
    // get all block states/properties
    const states = permutation.getAllStates();
    const names = Object.keys(states);
    // check block
    if (!names.length && !block.type.canBeWaterlogged)
        return message(`${block.typeId} has no properties`, player);
    // retrieve property name
    let prop = record[player.id];
    let val;
    // check if recorded state are available in the block
    if (prop == "waterlogged" ? !block.type.canBeWaterlogged : !names.includes(prop))
        prop = names[0];
    if (!prop && block.type.canBeWaterlogged)
        prop  = "waterlogged";
    // toggle waterlogged
    if (prop == "waterlogged") {
        val = !block.isWaterlogged;
        system.run(() => {
            block.isWaterlogged = val;
        });
    }
    // a property
    else {
        const valids = BlockStates.get(prop).validValues;
        val = valids[valids.indexOf(states[prop]) + 1];
        // loop through values
        if (typeof val === "undefined")
            val = valids[0];
        // update property
        system.run(() => {
            block.setPermutation(permutation.withState(prop, val));
        });
    }
    // update record
    record[player.id] = prop;
    // send message
    message(`"${prop}" to ${val}`, player);
});
