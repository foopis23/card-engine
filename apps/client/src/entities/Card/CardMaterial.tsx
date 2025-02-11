import React from 'react'
import { useTexture } from "@react-three/drei"
import { Suspense } from "react"
import * as THREE from "three"

const shader = {
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv; // Pass UV coordinates to the fragment shader
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: `
		uniform sampler2D frontTexture; // The texture
		uniform sampler2D backTexture; // The texture
		varying vec2 vUv; // UV coordinates from the vertex shader
		void main() {
			if (gl_FrontFacing) {
				vec4 color = texture2D(frontTexture, vUv); // Sample the texture
				gl_FragColor = color; // Output the color
			} else {
				vec4 color = texture2D(backTexture, vUv); // Sample the texture
				gl_FragColor = color; // Output the color
			}
		}
	`,
} as const;


type CardTextures = {
	front: string,
	back: string
}

type CardProps = {
	textures: CardTextures
}

export default function CardMaterial(props: CardProps) {
	return (
		<Suspense fallback={<meshBasicMaterial color="white" />}>
			<TexturedCardMaterial {...props} />
		</Suspense>
	)
}

function TexturedCardMaterial({ textures }: Pick<CardProps, 'textures'>) {
	const [
		frontTexture,
		backTexture
	] = useTexture([textures.front, textures.back])

	return (
		<shaderMaterial
			uniforms={{
				frontTexture: { value: frontTexture },
				backTexture: { value: backTexture }
			}}
			side={THREE.DoubleSide}
			vertexShader={shader.vertexShader}
			fragmentShader={shader.fragmentShader}
		/>
	)
}

