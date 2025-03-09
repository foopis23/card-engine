import { io, Socket } from "socket.io-client";
import { world } from "./ecs";
import { NetworkIdentity } from "./ecs/traits";
import { destroyCard, spawnCard, updateOwner } from "./ecs/actions";

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'ws://localhost:3001';

let host = false;
export function setHost(value: boolean) {
  host = value;
}


export type Events = {
  updatePos: (networkId: string, pos: { x: number, y: number, z: number }) => void;
  updateFlip: (networkId: string, flipped: boolean) => void;
  spawnCard: (networkIdentity: { id: string, owner: string }) => void,
  destroyCard: (entityId: string) => void,
  updateOwner: (entityId: string, owner: string) => void,
  requestSyncState: () => void,
  syncState: (state: ({ networkIdentity: { id: string, owner: string } })[]) => void,
}

export type ClientGameSocket = Socket<
  Events,
  Events
>;

export const socket: ClientGameSocket = io(URL);

socket.on("connect", () => {
  console.log("connected");
});

socket.on("disconnect", () => {
  console.log("disconnected");
});

socket.on("spawnCard", (networkIdentity) => {
  spawnCard(world, networkIdentity);
});

socket.on("destroyCard", (entityId) => {
  const entity = world.query(NetworkIdentity)
    .find(entity => entity.get(NetworkIdentity)!.id === entityId);

  if (entity) {
    destroyCard(world, entity);
  } else {
    console.error(`Entity with id ${entityId} not found`);
  }
});

//#region Networking
export const posMap = new Map<string, { x: number, y: number, z: number }>();
socket.on("updatePos", (entityId: string, pos: { x: number, y: number, z: number }) => {
  posMap.set(entityId, pos);
});

export const flipMap = new Map<string, boolean>();
socket.on("updateFlip", (entityId: string, flipped: boolean) => {
  flipMap.set(entityId, flipped);
});


socket.on("updateOwner", (entityId: string, owner: string) => {
  const entity = world.query(NetworkIdentity)
    .find(entity => entity.get(NetworkIdentity)!.id === entityId);

  if (!entity) {
    console.error(`Entity with id ${entityId} not found`);
    return
  }

  updateOwner(world, entity, owner);
});

socket.on("syncState", (state) => {
  // existing network identities
  const ids = new Set();
  world.query(NetworkIdentity).forEach((entity) => {
    ids.add(entity.get(NetworkIdentity)!.id);
  });

  // new network identities
  state.forEach(({ networkIdentity }) => {
    if (!ids.has(networkIdentity.id)) {
      spawnCard(world, networkIdentity);
    }
  });
});

socket.on("requestSyncState", () => {
  if (host) {
    const state = world.query(NetworkIdentity)
      .map(entity => {
        const networkIdentity = entity.get(NetworkIdentity)!;
        return { networkIdentity };
      });
    socket.emit("syncState", state);
  }
});