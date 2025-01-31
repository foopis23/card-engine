import { Server, Socket } from "socket.io";
import { Server as HttpServer } from 'http'
import { Room } from "./room";
import { globalLogger } from "../logger";
import type { Logger } from "pino";
import type { Commands, Messages } from "./commands";

export interface ServerToClientEvents extends Messages {
	allEntities: (entities: { [key: string]: { [key: string]: { value: any, timestamp: number } } }) => void;
}

export interface ClientToServerEvents extends Commands { }

export interface InterServerEvents {

}

export interface SocketData {
	memberId: string;
	logger: Logger;
}

export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function initGameServer(port: number) {
	const logger = globalLogger.child({ module: 'game-server' });

	const server: GameServer = new Server({
		cors: {
			origin: "*",
			methods: ["GET", "POST"]
		}
	})

	// TODO: make multiple rooms and a join and leave system
	// for testing, 1 room that everyone is apart of
	const roomName = "hello-world"
	const room = new Room();

	room.events.on('componentSet', (...args) => {
		server.to(roomName).emit('componentSet', ...args);
	})

	room.events.on('entitySpawned', (...args) => {
		server.to(roomName).emit('entitySpawned', ...args);
	})

	room.events.on('entityDestroyed', (...args) => {
		server.to(roomName).emit('entityDestroyed', ...args);
	});

	server.on('connection', (client) => {
		// init client socket
		client.data.memberId = crypto.randomUUID();
		client.data.logger = logger.child({ memberId: client.data.memberId });
		client.join(roomName);

		client.data.logger.info('Client Connected');

		// handle game commands
		client.on('spawnEntity', room.spawnEntity.bind(room));
		client.on('destroyEntity', room.destroyEntity.bind(room));
		client.on('setComponent', room.setComponent.bind(room));

		// handle socket events 
		client.on('disconnect', () => {
			client.data.logger.info('Client Disconnected');
		});
	});

	return server.listen(port)
}


