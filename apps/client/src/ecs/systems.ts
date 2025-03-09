import { Or, World } from "koota";
import {
  Flippable,
  Holdable,
  MainCamera,
  NetworkIdentity,
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
import { flipMap, posMap, socket } from "../socket";
import { Schedule } from "directed";

type System = (ctx: { world: World; delta: number }) => void;

export const flipSystem: System = ({ world }) => {
  world
    .query(NetworkIdentity, Flippable, RigidBodyRef)
    .updateEach(([authority, flippable, body]) => {
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

export const holdSystem: System = ({ world, delta }) => {
  const liftHeight = 0.25;

  // on held tick
  world
    .query(Holdable, NetworkIdentity, RigidBodyRef)
    .updateEach(([holdable, authority, body]) => {
      if (holdable.user !== getUserId() || authority.owner !== getUserId()) {
        return;
      }

      if (!holdable.held) {
        return;
      } else {
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
                20 * delta,
              ),
            ),
            true,
          );
        }
      }
    });
};

export const syncPositionSystem: System = ({ world }) => {
  world.query(NetworkIdentity, RigidBodyRef).updateEach(([identity, body]) => {
    if (identity.owner !== getUserId()) {
      if (posMap.has(identity.id)) {
        const pos = posMap.get(identity.id)!;
        body.ref.setTranslation(pos, true);
      }
    } else {
      const pos = body.ref.translation();
      socket.emit("updatePos", identity.id, pos);
    }
  });
}

export const syncFlipSystem: System = ({ world }) => {
  world.query(NetworkIdentity, Flippable, RigidBodyRef).updateEach(([identity, flippable]) => {
    if (identity.owner !== getUserId()) {
      if (flipMap.has(identity.id)) {
        const flipped = flipMap.get(identity.id)!;
        flippable.flipped = flipped
      }
    } else {
      socket.emit("updateFlip", identity.id, flippable.flipped);
    }
  });
}

/**
 * This system resolves conflicts between systems that want to disable translation
 */
export const disableTranslationSystem: System = ({ world }) => {
  world.query(NetworkIdentity, RigidBodyRef, Or(Holdable)).updateEach(([identity, body, holdable]) => {
    if (identity.owner !== getUserId()) {
      return;
    }
    let disableTranslation = false;
    if (holdable) {
      disableTranslation = holdable.held;
    }

    if (disableTranslation) {
      body.ref.lockTranslations(true, true)
    } else {
      body.ref.lockTranslations(false, true)
    }
  })
}

export const disableBodySystem: System = ({ world }) => {
  world.query(NetworkIdentity, RigidBodyRef).updateEach(([identity, body]) => {
    if (identity.owner !== getUserId() && body.ref.isEnabled()) {
      body.ref.setEnabled(false);
    } else if (!body.ref.isEnabled()) {
      body.ref.setEnabled(true);
    }
  });
}

export const schedule = new Schedule<{ world: World; delta: number }>();
schedule.add(flipSystem);
schedule.add(holdSystem);
schedule.add(syncPositionSystem)
schedule.add(syncFlipSystem)
schedule.add(disableTranslationSystem)
schedule.add(disableBodySystem)
schedule.build();
