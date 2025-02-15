import { World } from "koota";
import {
  Flippable,
  Holdable,
  MainCamera,
  NetworkAuthority,
  Pointer,
  RigidBodyRef,
} from "./traits";
import { getUserId } from "../util/userId";
import { Euler, Plane, Quaternion, Raycaster, Vector3 } from "three";
import {
  positionFromVector3,
  quaternionFromRotation,
  rotationFromQuaternion,
  vector3FromPosition,
} from "../util/rapier";

type System = (ctx: { world: World; delta: number }) => void;

export const flipSystem: System = ({ world }) => {
  world
    .query(NetworkAuthority, Flippable, RigidBodyRef)
    .updateEach(([authority, flippable, body]) => {
      if (authority.user !== getUserId()) {
        return;
      }

      const currentRot = quaternionFromRotation(body.ref.rotation());

      if (flippable.flipped) {
        const target = new Quaternion().setFromEuler(
          new Euler().setFromVector3(
            new Vector3()
              .setFromEuler(new Euler().setFromQuaternion(currentRot))
              .setZ(Math.PI),
          ),
        );

        body.ref.setRotation(
          rotationFromQuaternion(currentRot.slerp(target, 0.15)),
          true,
        );
      } else {
        const target = new Quaternion().setFromEuler(
          new Euler().setFromVector3(
            new Vector3()
              .setFromEuler(new Euler().setFromQuaternion(currentRot))
              .setZ(0),
          ),
        );

        body.ref.setRotation(
          rotationFromQuaternion(currentRot.slerp(target, 0.15)),
          true,
        );
      }
    });
};

export const holdSystem: System = ({ world }) => {
  const liftHeight = 0.25;

  // on held tick
  world
    .query(Holdable, NetworkAuthority, RigidBodyRef)
    .updateEach(([holdable, authority, body]) => {
      if (holdable.user !== getUserId() || authority.user !== getUserId()) {
        return;
      }

      if (!holdable.held) {
        body.ref.setEnabled(true);
        return;
      } else {
        body.ref.setEnabled(false);
        const mousePos = world.get(Pointer)?.pos;
        const mainCamera = world.get(MainCamera);

        if (!mousePos || !mainCamera) {
          return;
        }

        const plane = new Plane(new Vector3(0, 1, 0), 0); // TODO: this assumes the "table top" is at y=0
        const raycaster = new Raycaster();

        raycaster.setFromCamera(mousePos, mainCamera.camera);

        const intersectionPoint = new Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
          const currentPos = vector3FromPosition(body.ref.translation());

          body.ref.setTranslation(
            positionFromVector3(
              currentPos.lerp(
                intersectionPoint.add(new Vector3(0, liftHeight, 0)),
                0.4,
              ),
            ),
            true,
          );
        }
      }
    });
};
