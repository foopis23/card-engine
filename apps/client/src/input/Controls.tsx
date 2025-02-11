import React from 'react'
import { KeyboardControls, type KeyboardControlsEntry } from '@react-three/drei'
import { useMemo } from "react"
import { ACTIONS } from './Actions'

export default function Controls(props: { children?: React.ReactNode }) {
	const controlBindings = useMemo<KeyboardControlsEntry<ACTIONS>[]>(() => [
		{ name: ACTIONS.flip, keys: ['KeyF'] },
		{ name: ACTIONS.spawn, keys: ['KeyL'] },
		{ name: ACTIONS.delete, keys: ['KeyK'] }
	], [])

	return (
		<KeyboardControls map={controlBindings}>
			{props.children}
		</KeyboardControls>
	)
}