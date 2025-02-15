import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { ACTIONS } from "../../input/Actions";
import CardMaterial from "./CardMaterial";
import { getUserId } from "../../util/userId";
import { useActions } from "koota/react";
import type { Entity } from "koota";
import { Holdable, MeshRef, RigidBodyRef } from "../../ecs/traits";
import { actions } from "../../ecs";

export type CardProps = {
  entity: Entity;
};

export function Card2(props: CardProps) {
  const { entity } = props;

  // hooks
  const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();
  const { toggleGrabEntity, flipEntity } = useActions(actions);

  // register components
  const body = useRef<RapierRigidBody>(null!);
  const mesh = useRef<THREE.Mesh>(null!);

  // init
  useEffect(() => {
    entity.add(RigidBodyRef({ ref: body.current }));
    entity.add(MeshRef({ ref: mesh.current }));

    body.current.lockRotations(true, false);
    body.current.setEnabledRotations(false, false, false, false);
    body.current.setGravityScale(3, false);

    return () => {
      entity.remove(RigidBodyRef);
      entity.remove(MeshRef);
    };
  }, []);

  // keyboard input
  useEffect(() => {
    const cleanupFlip = onKeyboardEvent(
      (state) => state.flip,
      (pressed) => {
        const held = entity.get(Holdable);
        if (!held?.held) return;
        if (held.user !== getUserId()) return;

        if (pressed) {
          flipEntity(entity);
        }
      },
    );

    return () => {
      cleanupFlip();
    };
  }, []);

  // handlers
  const handleClick = useCallback(() => {
    toggleGrabEntity(entity, getUserId());
  }, [toggleGrabEntity]);

  return (
    <RigidBody ref={body} mass={1}>
      <CuboidCollider args={[1.25, 0.1, 1.75]}>
        <mesh
          onClick={handleClick}
          ref={mesh}
          castShadow={true}
          receiveShadow={true}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[2.5, 3.5]} />
          <CardMaterial
            textures={{
              front: "/full_deck/king_heart.png",
              back: "/full_deck/back.png",
            }}
          />
        </mesh>
      </CuboidCollider>
    </RigidBody>
  );
}
