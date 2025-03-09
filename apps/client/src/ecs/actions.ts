import { createActions, World, type Entity } from "koota";
import { Flippable, Holdable, Hoverable, NetworkIdentity } from "./traits";
import { socket } from "../socket";
import { getUserId } from "../util/userId";

// underlying implementation of spawnCard
export function spawnCard(world: World, networkAuthority: { id: string, owner: string }) {
	return world.spawn(
		NetworkIdentity({
			id: networkAuthority.id,
			owner: networkAuthority.owner,
		}),
		Flippable({
			flipped: false,
		}),
		Holdable({
			held: false,
			user: "",
		}),
		Hoverable({
			hovered: false,
		}),
	);
}

// underlying implementation of destroyCard
export function destroyCard(world: World, entity: Entity) {
	entity.destroy();
}

export function updateOwner(world: World, entity: Entity, owner: string) {
	if (!entity.has(NetworkIdentity)) {
		return;
	}

	entity.set(NetworkIdentity, (prev) => {
		return {
			...prev,
			owner: owner,
		};
	});
}

/**
 * Actions that the user can call to interact with the world
 */
export const actions = createActions((world) => ({
	spawnCard: (networkAuthority: { id: string, owner: string }) => {
		spawnCard(world, networkAuthority);
		socket.emit("spawnCard", networkAuthority);
	},
	destroyCard: (entity: Entity) => {
		destroyCard(world, entity);
		if (entity.has(NetworkIdentity)) {
			socket.emit("destroyCard", entity.get(NetworkIdentity)!.id);
		}
	},
	toggleGrabEntity: (entity: Entity, user: string) => {
		if (!entity.has(Holdable)) {
			return;
		}

		entity.set(Holdable, (prev) => {
			return {
				held: !prev.held,
				user: user,
			};
		});

		socket.emit("updateOwner", entity.get(NetworkIdentity)!.id, user);
		updateOwner(world, entity, user);
	},
	flipEntity: (entity: Entity) => {
		if (!entity.has(Flippable)) {
			return;
		}

		entity.set(Flippable, (prev) => {
			return {
				flipped: !prev.flipped,
			};
		});

		socket.emit("updateFlip", entity.get(NetworkIdentity)!.id, entity.get(Flippable)!.flipped);
		updateOwner(world, entity, getUserId());
	},
}));
