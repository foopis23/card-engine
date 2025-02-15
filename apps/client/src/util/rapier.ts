import { Quaternion, Vector3 } from "three";

type Rotation = { x: number; y: number; z: number; w: number };

export function quaternionFromRotation(rotation: {
  x: number;
  y: number;
  z: number;
  w: number;
}): Quaternion {
  return new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
}

export function vector3FromPosition(position: {
  x: number;
  y: number;
  z: number;
}): Vector3 {
  return new Vector3(position.x, position.y, position.z);
}

export function rotationFromQuaternion(quaternion: Quaternion): Rotation {
  return {
    x: quaternion.x,
    y: quaternion.y,
    z: quaternion.z,
    w: quaternion.w,
  };
}

export function positionFromVector3(vector: Vector3): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: vector.x,
    y: vector.y,
    z: vector.z,
  };
}
