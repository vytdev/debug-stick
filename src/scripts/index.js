/*============================================================================*\
+*
+* This is the core of the debug stick add-on for Minecraft: Bedrock Edition
+*
+* Official links:
+* MCPEDL: https://mcpedl.com/debug-stick
+* GitHub: https://github.com/vytdev/debug-stick
+*
+* Script last updated: 1.5.0 (r1.20.60)
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
	return player.runCommandAsync(`title @s actionbar ${msg}`);
}

// listen for interaction with blocks
// change selected property
world.afterEvents.entityHitBlock.subscribe((ev) => {
	// check for player
	if (ev.damagingEntity.typeId != "minecraft:player") return;

	// the player
	const player = world.getAllPlayers().find(v => v.id == ev.damagingEntity.id);

	// check if player holds the debug stick
	if (player.getComponent("minecraft:inventory").container
		.getItem(player.selectedSlot)?.typeId != "vyt:debug_stick"
	) return;

	// block and its permutation
	const block = ev.hitBlock;
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
});

// listen for clicks in blocks
// sets the state value for the property
world.beforeEvents.itemUseOn.subscribe((ev) => {
	// check for player and his held item
	if (ev.source.typeId != "minecraft:player" || ev.itemStack?.typeId != "vyt:debug_stick")
		return;

	// cancel event behaviour
	ev.cancel = true;

	// the player
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
});
