// import { initGameServer } from "./game/game-server";

import { Server } from "socket.io";

const server = new Server({
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	}
})

// TODO: implement way to send to "host"
// TODO: implement way to send to specific user
// relay all events to all clients in the room except the sender
server.on("connection", (socket) => {
	socket.onAny((event, ...args) => {
		if (event === 'host') {
			socket.join("room-id")
			socket.send("host")
			return
		}
		server.to("room-id").except(socket.id).emit(event, ...args)
	})
});

server.listen(3001);