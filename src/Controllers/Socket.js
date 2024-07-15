const { Server } = require("socket.io")



exports.AttachSocket = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already attached');
        return res.end();
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const socketRoomMap = new Map();

    io.on("connection", (socket) => {
        console.log(`User Connected :${socket.id}`);
        socket.emit("size", socketRoomMap.size)
        // Triggered when a peer hits the join room button.
        socket.on("join", async (roomName) => {
            console.log("Someone Joining",roomName);
            const { rooms } = io.sockets.adapter;
            const room = rooms.get(roomName);
            socketRoomMap.set(socket.id, roomName);
            // room == undefined when no such room exists.
            console.log(socketRoomMap.size);
            if (room === undefined) {
                socket.join(roomName);
                socket.emit("created");

            } else if (room.size === 1) {
                // room.size == 1 when one person is inside the room.
                socket.join(roomName);
                socket.emit("joined");
                socket.to(roomName).emit("someone-joined", room?.size);
            } else {
                // when there are already two people inside the room.
                socket.emit("full");
            }
        });


        // Server-side (inside the connection event)
        socket.on("message", (message, roomName, userId) => {
            // console.log(`Received message in room ${roomName}:`, message);
            socket.to(roomName).emit("message", { content: message, sender: userId });
        });

        socket.on("disconnect", () => {
            // Retrieve the room information from the mapping
            const roomName = socketRoomMap.get(socket.id);

            // console.log(`User ${socket.id} disconnected from room ${roomName}`);
            // Perform cleanup or other actions if needed

            // Remove the user from the room
            if (roomName) {
                socket.broadcast.to(roomName).emit("leave");
                socket.leave(roomName);
            }

            // Remove the user's room information from the mapping
            socketRoomMap.delete(socket.id);
        });



        // Triggered when the person who joined the room is ready to communicate.
        socket.on("ready", (roomName) => {
            socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room.
        });

        // Triggered when server gets an icecandidate from a peer in the room.
        socket.on("ice-candidate", (candidate, roomName) => {
            // console.log(candidate, "candidate");
            socket.broadcast.to(roomName).emit("ice-candidate", candidate); // Sends Candidate to the other peer in the room.
        });

        // Triggered when server gets an offer from a peer in the room.
        socket.on("offer", (offer, roomName) => {
            socket.broadcast.to(roomName).emit("offer", offer); // Sends Offer to the other peer in the room.
        });

        // Triggered when server gets an answer from a peer in the room.
        socket.on("answer", (answer, roomName) => {
            socket.broadcast.to(roomName).emit("answer", answer); // Sends Answer to the other peer in the room.
        });

        socket.on("leave", (roomName) => {
            socket.broadcast.to(roomName).emit("leave");
            socket.leave(roomName);
        });

    });
    return res.end();
}