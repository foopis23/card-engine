export type Messages = {
	entitySpawned: (entityId: string, owner: string) => void,
	entityDestroyed: (entityId: string) => void,
	componentSet: (entityId: string, componentName: string, value: any) => void,
	ownerSet: (entityId: string, playerId: string) => void,
}

export type Commands = {
	spawnEntity(entityId: string, playerId: string): void,
	destroyEntity(entityId: string): void,
	setComponent(entityId: string, componentName: string, value: any, timestamp: number): void,
	setOwner(entityId: string, playerId: string): void,
}
