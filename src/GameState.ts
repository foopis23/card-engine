import { create } from 'zustand'

export const useGameStateStore = create<{
	cards: string[],
	stacks: string[],
	spawnStack: () => void,
	despawnStack: (id: string) => void,
	spawnCard: () => void,
	despawnCard: (id: string) => void
}>((set) => ({
	cards: [] as string[],
	stacks: [] as string[],
	spawnStack: () => set((state) => ({
		stacks: [...state.stacks, self.crypto.randomUUID()],
	})),
	despawnStack: (id: string) => set((state) => ({
		stacks: state.stacks.filter((stack) => stack !== id)
	})),
	spawnCard: () => set((state) => ({
		cards: [...state.cards, self.crypto.randomUUID()]
	})),
	despawnCard: (id: string) => set((state) => ({
		cards: state.cards.filter((card) => card !== id)
	}))
}))