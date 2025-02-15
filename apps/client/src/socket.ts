import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../server/game/game-server";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.GAME_SERVER_URL;

export type ClientGameSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export const socket: ClientGameSocket = io(URL);

socket.on("connect", () => {
  console.log("connected");
});

socket.on("disconnect", () => {
  console.log("disconnected");
});

socket.on("entitySpawned", (entityId: string) => {
  console.log("entitySpawned", entityId);
});
