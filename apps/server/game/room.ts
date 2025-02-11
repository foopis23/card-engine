import type { Commands, Messages } from './commands';
import { TEventEmitter } from '../util/TypedEmitter';

export type Component = {
	value: any
	lastWrite: number
}
export type Entity = {
	owner: string
	components: Map<string, Component>
}

// https://www.figma.com/blog/how-figmas-multiplayer-technology-works/
export class Room implements Commands {
	public readonly events: TEventEmitter<Messages>;
	private readonly entities: Map<string, Entity>;

	constructor() {
		this.entities = new Map();
		this.events = new TEventEmitter();
	}

	setOwner(entityId: string, playerId: string): void {
		const entity = this.entities.get(entityId);
		if (!entity) return;
		if (entity.owner === playerId) return;

		entity.owner = playerId;
		this.events.emit('ownerSet', entityId, playerId);
	}

	/** Explicit action, no CRDT */
	spawnEntity(entityId: string, playerId: string) {
		this.entities.set(entityId, {
			owner: playerId,
			components: new Map()
		});
		this.events.emit('entitySpawned', entityId, playerId);
	}

	/** Explicit action, no CRDT */
	destroyEntity(entityId: string) {
		this.entities.delete(entityId);
		this.events.emit('entityDestroyed', entityId);
	}

	/** CRDT Last Write */
	setComponent(entityId: string, componentName: string, value: any, timestamp: number) {
		const entity = this.entities.get(entityId);
		if (!entity) { // this case will happen if one user deletes an entity that another user is interacting with. That fine, deletes are explict actions
			return;
		}

		const component = entity.components.get(componentName);

		if (!component) { // if the component doesn't exist, just set it
			entity.components.set(componentName, { value, lastWrite: timestamp });
			this.events.emit('componentSet', entityId, componentName, value);
		} else if (component.lastWrite < timestamp) { // if component does exist, use last write to determine if we should update
			entity.components.set(componentName, { value, lastWrite: timestamp });
			this.events.emit('componentSet', entityId, componentName, value);
		}
	}

	getEntities() {
		return {
			entities: Object.fromEntries(this.entities.entries())
		}
	}
}
