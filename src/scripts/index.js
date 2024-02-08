/*============================================================================*\
+*
+* This is the core of the debug stick add-on for Minecraft: Bedrock Edition
+*
+* Official links:
+* MCPEDL: https://mcpedl.com/debug-stick
+* GitHub: https://github.com/vytdev/debug-stick
+*
+* Script last updated: 1.6.0 (r1.20.60)
+*
+* Copyright (c) 2023-2024 VYT <https://vytdev.github.io>
+* This project is licensed under the MIT License.
+* See LICENSE for more details.
+*
\*============================================================================*/

import { BlockStates, world, system } from "@minecraft/server";

// record of: player id -> selected property name
const record = {};

// show message to player's actionbar
function message(msg, player) {
	return player.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"text":${JSON.stringify(msg)}}]}`);
}

// listen for interaction with blocks
world.afterEvents.entityHitBlock.subscribe((ev) => {
	// check for player
	if (ev.damagingEntity.typeId != "minecraft:player") return;

	// the player
	const player = world.getAllPlayers().find(v => v.id == ev.damagingEntity.id);

	// check if player holds the debug stick
	if (player.getComponent("minecraft:inventory").container
		.getItem(player.selectedSlot)?.typeId != "vyt:debug_stick"
	) return;

	// change selected property for block
	changeSelectedProperty(player, ev.hitBlock);
});

// listen for clicks in blocks
world.beforeEvents.itemUseOn.subscribe((ev) => {
	// check for player and his held item
	if (ev.source.typeId != "minecraft:player" || ev.itemStack?.typeId != "vyt:debug_stick")
		return;

	// cancel event behaviour
	ev.cancel = true;

	// the player
	const player = world.getAllPlayers().find(v => v.id == ev.source.id);

	// display info about the block
	if (player.isSneaking) displayBlockInfo(player, ev.block);
	// update block property
	else updateBlockProperty(player, ev.block);
});


/*============================================================================*\
+* Action functions
\*============================================================================*/

// change selected property
function changeSelectedProperty(player, block) {
	// the permutation of block
	const permutation = block.permutation;

	// get a list of allowed states for block
	const states = permutation.getAllStates();
	const names = Object.keys(states);

	// check if block has any property to change
	if (!names.length && !block.type.canBeWaterlogged)
		return message(`${block.typeId} has no properties`, player);

	// get the next property name
	let prop = names[names.indexOf(record[player.id]) + 1];
	let val = states[prop];

	// prop is undefined, it means we reached the end of the property list
	if (!prop) {
		// check if waterlog property is available
		if (block.type.canBeWaterlogged) {
			prop = "waterlogged";
			val = block.isWaterlogged;
		}
		// else, use the first property instead
		else {
			prop = names[0];
			val = states[prop];
		}
	}

	// update the player's record
	record[player.id] = prop;

	// send response message
	message(`selected "${prop}" (${val})`, player);
}

// sets the state value for the property on block
function updateBlockProperty(player, block) {
	// the permutation of block
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

	// check if recorded state is available on the block
	if (prop == "waterlogged" ? !block.type.canBeWaterlogged : !names.includes(prop))
		prop = names[0];
	// change the waterlog property instead
	if (!prop && block.type.canBeWaterlogged) prop  = "waterlogged";

	// toggle waterlog
	if (prop == "waterlogged") {
		val = !block.isWaterlogged;
		// delayed because we're in read-only mode
		system.run(() => {
			block.setWaterlogged(val);
		});
	}

	// it is a property
	else {
		// get the valid property values
		const valids = BlockStates.get(prop).validValues;
		val = valids[valids.indexOf(states[prop]) + 1];

		// val is undefined, set to the first value again
		if (typeof val === "undefined") val = valids[0];

		// update property
		system.run(() => {
			block.setPermutation(permutation.withState(prop, val));
		});
	}

	// update record
	record[player.id] = prop;
	// send response message
	message(`"${prop}" to ${val}`, player);
}

// shows some useful details about the block
function displayBlockInfo(player, block) {
	// block id
	let info = "§l§b" + block.typeId + "§r";

	// block coordinates
	info += "\n§4" + block.x + " §a" + block.y + " §9" + block.z;

	// the matter state
	info += "\n§7matter state§8: §e";
	if (block.isLiquid) info += "liquid";
	else if (block.isAir) info += "gas";
	else info += "solid";

	// whether the block is solid and impassible
	info += "\n§7hard block§8: " + (block.isSolid ? "§ayes" : "§cno");

	// redstone power
	info += "\n§7redstone power§8: §c" + (block.getRedstonePower() ?? 0);

	// block states/properties
	Object.entries(block.permutation.getAllStates()).forEach(([k, v]) => {
		info += "\n§o§7" + k + "§r§8: ";
		if (typeof v == "string") info += "§e";
		if (typeof v == "number") info += "§3";
		if (typeof v == "boolean") info += "§6";
		info += v;
	});

	// waterlog property
	if (block.type.canBeWaterlogged) info += "\n§o§7waterlogged§r§8: §6" + block.isWaterlogged;

	// block tags
	block.getTags().forEach(v => info += "\n§d#" + v);

	// show to player
	message(info, player);
}
