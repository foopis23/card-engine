import React from 'react'
import { useEffect } from 'react';
import { Card } from './entities/Card/Card';
import Table from './entities/Table';
import { useGameStateStore } from './GameState'
import { ACTIONS } from './input/Actions';
import { useKeyboardControls } from '@react-three/drei';
import { socket } from './socket';

export default function Game() {
	const cards = useGameStateStore((state) => state.cards);
	const spawnCard = useGameStateStore((state) => state.spawnCard);
	const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();

	useEffect(() => onKeyboardEvent(
		(state) => state.spawn,
		(pressed) => {
			if (pressed) {
				socket.emit('spawnEntity', self.crypto.randomUUID())
			}
		}
	), [onKeyboardEvent]);

	useEffect(() => {
		function handleEntitySpawned(entityId: string) {
			spawnCard();
		}
		socket.on('entitySpawned', handleEntitySpawned)

		return () => {
			socket.off('entitySpawned', handleEntitySpawned)
		}
	}, [])

	return (
		<>
			{cards.map((card) => (
				<Card uuid={card} key={card} />
			))}
			<Table position={[0, -1, 0]} size={[40, 1, 40]} />
		</>
	)
}