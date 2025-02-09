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
import { getUserId } from '../../util/userId';
import { socket } from '../../socket';
import { useFixedTick } from '../../hooks/useFixedTick';

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
	initialOwner: string,
	destroy: () => void
}

const liftHeight = 0.25;

export function Card(props: CardProps) {
	const { uuid, destroy, initialOwner } = props;
	const body = useRef<RapierRigidBody | null>(null);
	const three = useThree();

	const selected = useRef<boolean>(false);
	const flipped = useRef<boolean>(false);
	const hovering = useRef<boolean>(false);
	const owner = useRef(initialOwner);
	const targetPos = useRef<THREE.Vector3 | null>(null);
	const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();

	//#region Base Actions
	function setOwner(playerId: string) {
		owner.current = playerId;
		socket.emit('setOwner', uuid, playerId);
	}

	const flip = useCallback(() => {
		setOwner(getUserId());
		flipped.current = !flipped.current;
	}, [])

	const grab = useCallback(() => {
		setOwner(getUserId());
		selected.current = true;
		body.current?.setGravityScale(0, true);
	}, [])

	const release = useCallback(() => {
		setOwner(getUserId());
		selected.current = false;
		body.current?.setGravityScale(1, true);
		targetPos.current = null;
	}, [])

	const toggleGrab = useCallback(() => {
		setOwner(getUserId());
		selected.current = !selected.current;
	}, [])

	const setPos = useCallback((pos: [number, number, number]) => {
		if (!body.current) return;
		setOwner(getUserId());
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

	const doDelete = useCallback(() => {
		if (userScript) {
			const hook: () => boolean | undefined | null = userScript.global.get("onDelete");
			if (hook) {
				const result = hook()
				if (result === false) {
					return;
				}
			}
		}

		console.log("Destroying card", uuid);
		destroy();
	}, [props, userScript]);

	const doToggleGrab = useCallback(() => {
		if (selected.current) {
			doRelease();
		} else {
			doGrab();
		}
	}, [doGrab, doRelease]);

	//#region Init
	useEffect(() => { // keyboard input
		const cleanupFlip = onKeyboardEvent(
			(state) => state.flip,
			(pressed) => {
				if (!hovering.current) return;

				if (pressed) {
					doFlip();
				}
			})

		const cleanupDelete = onKeyboardEvent(
			(state) => state.delete,
			(pressed) => {
				if (!hovering.current) return;

				if (pressed) {
					doDelete();
				}
			}
		)

		return () => {
			cleanupFlip();
			cleanupDelete();
		}
	}, [doFlip, onKeyboardEvent, hovering])

	useEffect(() => { // body setup
		if (!body.current) {
			console.warn("No body ref");
			return;
		};

		body.current.lockRotations(true, false);
		body.current.setEnabledRotations(false, false, false, false);
	}, [])

	useEffect(() => { // userScript setup
		userScript?.global.set("flipped", flipped.current);
		userScript?.global.set("selected", selected.current);
		userScript?.global.set("hovering", hovering.current);
	}, [userScript])

	useEffect(() => { // networking
		function handleComponentSet(entityId: string, componentName: string, value: any) {
			if (entityId !== uuid) return;
			if (owner.current === getUserId()) return; // don't update if we're the owner

			if (componentName === "position") {
				targetPos.current = new THREE.Vector3(...value);
			}

			if (componentName === "flipped") {
				flipped.current = value;
			}
		}

		function handleOwnerSet(entityId: string, playerId: string) {
			if (entityId !== uuid) return;
			owner.current = playerId;
		}

		socket.on('componentSet', handleComponentSet)
		socket.on('ownerSet', handleOwnerSet)

		return () => {
			socket.off('componentSet', handleComponentSet)
			socket.off('ownerSet', handleOwnerSet)
		}
	}, [])

	//#region Movement

	const rotateTowardsTargetRotation = useCallback(() => {
		const phyBody = body.current;
		if (phyBody === null) return;
		const currentRot = new THREE.Euler().setFromQuaternion(
			new THREE.Quaternion(
				...Object.values(phyBody.rotation())
			)
		);
		const targetRot = flipped.current ? Math.PI : 0;
		const newRot = new THREE.Euler(
			0,
			0,
			currentRot.z + (targetRot - currentRot.z) * 0.2
		);
		const newQuat = new THREE.Quaternion().setFromEuler(newRot);
		phyBody.setRotation({
			x: newQuat.x,
			y: newQuat.y,
			z: newQuat.z,
			w: newQuat.w
		}, true);
	}, []);

	const moveTowardsTargetPosition = useCallback((delta: number) => {
		const phyBody = body.current;
		if (phyBody === null) return;
		if (targetPos.current === null) return;

		const pos = new THREE.Vector3(...Object.values(phyBody.translation()));
		const newPos = pos.lerp(targetPos.current, 10 * delta);
		phyBody.setTranslation(newPos, true)
	}, []);


	//#region Tick
	useFrame((_, delta) => {
		const phyBody = body.current;
		if (phyBody === null) return;

		userScript?.global.set("position", Object.values(phyBody.translation()));
		userScript?.global.set("rotation", Object.values(phyBody.rotation()));

		moveTowardsTargetPosition(delta);
		rotateTowardsTargetRotation();

		if (owner.current === getUserId()) {
			if (selected.current) {
				const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // TODO: this assumes the "table top" is at y=0
				const raycaster = new THREE.Raycaster();
				const pointer = three.pointer;
				raycaster.setFromCamera(pointer, three.camera);
				const intersectionPoint = new THREE.Vector3();
				if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
					targetPos.current = intersectionPoint.add(new THREE.Vector3(0, liftHeight, 0))
				}
			}
		}
	})

	useFixedTick(20, (_, delta) => {
		const phyBody = body.current;
		if (owner.current !== getUserId()) return;
		if (phyBody === null) return;

		socket.emit('setComponent', uuid, 'position', Object.values(phyBody.translation()), Date.now());
		socket.emit('setComponent', uuid, 'flipped', flipped.current, Date.now());
	})

	//#region Events
	function handleClick() {
		doToggleGrab();
	}

	function handleOver() {
		hovering.current = true;
	}

	function handleExit() {
		hovering.current = false;
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

