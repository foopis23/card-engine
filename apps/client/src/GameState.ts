import { create } from 'zustand'
import { socket } from '../socket'
import { useEffect } from 'react'
import { getUserId } from './util/userId'

export const useGameStateStore = create<{
	cards: { id: string, owner: string }[],
	spawnCard: (id: string, ownerId: string) => void,
	despawnCard: (id: string) => void
}>((set) => ({
	cards: [] as { id: string, owner: string }[],
	spawnCard: (id: string, ownerId: string) => set((state) => ({
		cards: [...state.cards, { id: id || '', owner: ownerId }]
	})),
	despawnCard: (id: string) => set((state) => ({
		cards: state.cards.filter((card) => card.id !== id)
	}))
}))

export const useSpawning = () => {
	const _spawnCard = useGameStateStore((state) => state.spawnCard)
	const _despawnCard = useGameStateStore((state) => state.despawnCard)

	const handleEntitiySpawned = (entityId: string, ownerId: string) => {
		_spawnCard(entityId, ownerId)
	}

	const handleEntityDespawned = (entityId: string) => {
		_despawnCard(entityId)
	}

	useEffect(() => {
		socket.on('entitySpawned', handleEntitiySpawned)
		socket.on('entityDestroyed', handleEntityDespawned)

		return () => {
			socket.off('entitySpawned', handleEntitiySpawned)
			socket.off('entityDestroyed', handleEntityDespawned)
		}
	}, [])

	const spawnCard = () => {
		socket.emit('spawnEntity', self.crypto.randomUUID(), getUserId())
	}

	const destroyCard = (id: string) => {
		socket.emit('destroyEntity', id)
	}

	return { spawnCard, destroyCard }
}