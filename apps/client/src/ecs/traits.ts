import type { RapierRigidBody } from "@react-three/rapier";
import { trait } from "koota";
import { Camera, PerspectiveCamera, Vector2, type Mesh } from "three";

//#region Entity Traits
export const NetworkAuthority = trait({
  user: "",
});

export const RigidBodyRef = trait<{ ref: RapierRigidBody }>({
  ref: null!,
});

export const MeshRef = trait<{ ref: Mesh }>({
  ref: null!,
});

export const Flippable = trait({
  flipped: false,
});

export const Holdable = trait({
  held: false,
  user: "",
});

export const Hoverable = trait({
  hovered: false,
});

//#region World Traits
export const Pointer = trait({
  pos: new Vector2(),
});

export const MainCamera = trait<{ camera: Camera }>({
  camera: new PerspectiveCamera(),
});
