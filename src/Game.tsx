import { useEffect } from 'react';
import { Card } from './entities/Card/Card';
import Table from './entities/Table';
import { useGameStateStore, useSpawning } from './GameState'
import { ACTIONS } from './input/Actions';
import { useKeyboardControls } from '@react-three/drei';

export default function Game() {
	const {
		spawnCard,
		destroyCard
	} = useSpawning();
	const cards = useGameStateStore((state) => state.cards);
	const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();

	useEffect(() => onKeyboardEvent(
		(state) => state.spawn,
		(pressed) => {
			if (pressed) {
				spawnCard()
			}
		}
	), [onKeyboardEvent]);

	return (
		<>
			{cards.map((card) => (
				<Card
					uuid={card.id}
					key={card.id}
					destroy={() => destroyCard(card.id)}
					initialOwner={card.owner}
				/>
			))}
			<Table position={[0, -1, 0]} size={[40, 1, 40]} />
		</>
	)
}