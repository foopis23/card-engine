export type Messages = {
	entitySpawned: (entityId: string) => void,
	entityDestroyed: (entityId: string) => void,
	componentSet: (entityId: string, componentName: string, value: any) => void,
}

export type Commands = {
	spawnEntity(entityId: string): void,
	destroyEntity(entityId: string): void,
	setComponent(entityId: string, componentName: string, value: any, timestamp: number): void,
}
