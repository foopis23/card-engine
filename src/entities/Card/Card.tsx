import React from 'react'
import { CuboidCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { ACTIONS } from "../../input/Actions";
import CardMaterial from "./CardMaterial";
import { useLua } from "../../hooks/lua";
import { LuaEngine } from "wasmoon";

// export type CardProps = {
// 	name?: string,
// 	description?: string,
// 	textures: {
// 		front: string,
// 		back: string
// 	},
// 	initialPosition?: [number, number, number],
// 	initiallyFlipped?: boolean
// }

export type CardProps = {
	uuid: string,
}

const liftHeight = 0.25;

export function Card(props: CardProps) {
	const { uuid } = props;
	console.log(uuid);

	const body = useRef<RapierRigidBody | null>(null);
	const three = useThree();

	const [selected, setSelected] = useState<boolean>(false);
	const [flipped, setFlipped] = useState<boolean>(false);
	const [hovering, setHovering] = useState<boolean>(false);
	const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();

	//#region Base Actions
	const flip = useCallback(() => {
		setFlipped((flipped) => !flipped);
	}, [])

	const grab = useCallback(() => {
		setSelected(true);
	}, [])

	const release = useCallback(() => {
		setSelected(false);
	}, [])

	const toggleGrab = useCallback(() => {
		setSelected((selected) => !selected);
	}, [])

	const setPos = useCallback((pos: [number, number, number]) => {
		if (!body.current) return;
		body.current.setTranslation(new THREE.Vector3(...pos), true)
	}, [])

	const onLuaLoad = useCallback((lua: LuaEngine) => {
		lua.global.set("flip", flip);
		lua.global.set("grab", grab);
		lua.global.set("release", release);
		lua.global.set("toggleGrab", toggleGrab);
		lua.global.set("setPos", setPos);
	}, [flip, grab, release, toggleGrab, setPos])

	const userScript = useLua('/custom-card-type.lua', onLuaLoad);

	//#region Actions With Hooks
	const doFlip = useCallback(() => {
		if (userScript) {
			const hook: () => boolean | undefined | null = userScript.global.get("onFlip");
			if (hook) {
				const result = hook()
				if (result === false) {
					return;
				}
			}
		}

		flip();
	}, [flip, userScript])

	const doGrab = useCallback(() => {
		if (userScript) {
			const hook: () => boolean | undefined | null = userScript.global.get("onGrab");
			if (hook) {
				const result = hook()
				if (result === false) {
					return;
				}
			}
		}

		grab();
	}, [grab, userScript])

	const doRelease = useCallback(() => {
		if (userScript) {
			const hook: () => boolean | undefined | null = userScript.global.get("onRelease");
			if (hook) {
				const result = hook()
				if (result === false) {
					return;
				}
			}
		}

		release();
	}, [release, userScript]);

	const doToggleGrab = useCallback(() => {
		if (selected) {
			doRelease();
		} else {
			doGrab();
		}
	}, [doGrab, doRelease, selected]);

	//#region Init
	useEffect(() => {
		return onKeyboardEvent(
			(state) => state.flip,
			(pressed) => {
				if (!hovering) return;

				if (pressed) {
					doFlip();
				}
			})
	}, [doFlip, onKeyboardEvent, hovering])

	useEffect(() => {
		if (!body.current) {
			console.warn("No body ref");
			return;
		};

		body.current.lockRotations(true, false);
		body.current.setEnabledRotations(false, false, false, false);
	}, [])

	useEffect(() => {
		userScript?.global.set("flipped", flipped);
		userScript?.global.set("selected", selected);
		userScript?.global.set("hovering", hovering);
	}, [selected, hovering, flipped, userScript])


	//#region Tick
	useFrame(() => {
		if (body.current === null) return;

		userScript?.global.set("position", Object.values(body.current.translation()));
		userScript?.global.set("rotation", Object.values(body.current.rotation()));

		const currentRot = new THREE.Euler().setFromQuaternion(
			new THREE.Quaternion(
				...Object.values(body.current.rotation())
			)
		);
		const targetRot = flipped ? Math.PI : 0;
		const newRot = new THREE.Euler(
			0,
			0,
			currentRot.z + (targetRot - currentRot.z) * 0.2
		);

		const newQuat = new THREE.Quaternion().setFromEuler(newRot);

		body.current.setRotation({
			x: newQuat.x,
			y: newQuat.y,
			z: newQuat.z,
			w: newQuat.w
		}, true);


		if (!selected) {
			body.current.setGravityScale(1, false);
			return
		}

		body.current.setGravityScale(0, false);

		const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // TODO: this assumes the "table top" is at y=0

		const raycaster = new THREE.Raycaster();
		const pointer = three.pointer;
		raycaster.setFromCamera(pointer, three.camera);
		const intersectionPoint = new THREE.Vector3();
		if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
			const pos = new THREE.Vector3(...Object.values(body.current.translation()));
			const newPos = pos.lerp(intersectionPoint.add(new THREE.Vector3(0, liftHeight, 0)), 0.3);
			body.current.setTranslation(newPos, true)
		}
	})

	//#region Events
	function handleClick() {
		doToggleGrab();
	}

	function handleOver() {
		setHovering(true);
	}

	function handleExit() {
		setHovering(false);
	}

	return (
		<RigidBody ref={body} position={[0, 0, 0]} mass={1}>
			<CuboidCollider args={[1.25, 0.1, 1.75]}>
				<mesh onPointerOver={handleOver} onPointerLeave={handleExit} onClick={handleClick} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[2.5, 3.5]} />
					<CardMaterial textures={{
						front: "/full_deck/king_heart.png",
						back: "/full_deck/back.png"
					}} />
				</mesh>
			</CuboidCollider>
		</RigidBody>
	)
}

