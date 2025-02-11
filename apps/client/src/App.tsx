import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { Physics } from '@react-three/rapier'
import Controls from './input/Controls'
import Game from './Game'


function App() {
 	return (
		<div id="canvas-container" className="h-full w-full flex">
			<Controls>
				<Canvas camera={{ position: [0, 10, 10], rotation: [-Math.PI / 4, 0, 0] }}>
					<Suspense>
						<Physics>
							<Game />
						</Physics>
					</Suspense>
				</Canvas>
			</Controls>
		</div>
	)
}

export default App
