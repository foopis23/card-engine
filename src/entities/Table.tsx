import React from 'react'
import type { BoxGeometryProps, Object3DProps } from "@react-three/fiber";
import { type CuboidArgs, CuboidCollider } from "@react-three/rapier";

type TableProps = Readonly<{
	position: Object3DProps["position"],
	size: [number, number, number]
}>;

export default function Table({
	position,
	size
}: TableProps) {
	const colliderArgs: CuboidArgs = [size[0] / 2, size[1] / 2, size[2] / 2];
	const geoSize: BoxGeometryProps['args'] = [size[0], size[1], size[2]];

	return (
		<CuboidCollider position={position} args={colliderArgs}>
			<mesh>
				<boxGeometry args={geoSize}  />
				<meshBasicMaterial color="#35654d" />
			</mesh>
		</CuboidCollider>
	)
}