const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const env = require("dotenv");
const bodyParser = require("body-parser");
const socketIO = require("socket.io");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
let users = [];

env.config();
const authRoutes = require("./Routes/Auth");
const authRoutesV2 = require("./Routes/AuthV2");
const roomRoutes = require("./Routes/Generator");
const sessionRoutes = require("./Routes/Session");
const socketRoute = require("./Routes/Socket");
const roomRoute = require("./Routes/Room");
const { createMeeting } = require("./Controllers/Generator");
const path = require("path");

app.use((req, res, next) => {
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const addUser = (userName, roomId) => {
  users.push({
    userName: userName,
    roomId: roomId,
  });
};

const getRoomUsers = (roomId) => {
  return users.filter((user) => user.roomId === roomId);
};
const userLeave = (userName) => {
  users = users.filter((user) => user.userName != userName);
};
const socketRoomMap = new Map();

io.on("connection", (socket) => {
  console.log("Client Connected");

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });

  socket.on("join", async (roomName) => {
    console.log("Someone Joining", roomName);
    const { rooms } = io.sockets.adapter;
    const room = rooms.get(roomName);
    socketRoomMap.set(socket.id, roomName);
    console.log(socketRoomMap.size);
    if (room === undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else {
      socket.join(roomName);
      socket.emit("joined");
      socket.to(roomName).emit("someone-joined", room?.size);
    }
  });

  socket.on("message", (message, roomName, userId) => {
    socket.to(roomName).emit("message", { content: message, sender: userId });
  });

  socket.on("disconnect", () => {
    const roomName = socketRoomMap.get(socket.id);

    if (roomName) {
      socket.broadcast.to(roomName).emit("leave");
      socket.leave(roomName);
    }
    socketRoomMap.delete(socket.id);
  });

  socket.on("ready", (roomName) => {
    socket.broadcast.to(roomName).emit("ready");
  });

  socket.on("ice-candidate", (candidate, roomName) => {
    socket.broadcast.to(roomName).emit("ice-candidate", candidate);
  });

  socket.on("offer", (offer, roomName) => {
    socket.broadcast.to(roomName).emit("offer", offer);
  });
  socket.on("nego:offer", (offer, roomName) => {
    console.log("Nego Offer");
    socket.broadcast.to(roomName).emit("nego:offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.broadcast.to(roomName).emit("answer", answer);
  });

  socket.on("nego:answer", (answer, roomName) => {
    socket.broadcast.to(roomName).emit("nego:final", answer);
  });

  socket.on("leave", (roomName) => {
    socket.broadcast.to(roomName).emit("leave");
    socket.leave(roomName);
  });
});

app.use("/api", authRoutes);
app.use("/api/v2/auth", authRoutesV2);
app.use("/api/meeting", roomRoutes);

app.use("/api/room", roomRoute);
app.use("/socket", socketRoute);
app.use("/api/session", sessionRoutes);

app.get("/", (req, res) => {
  res.send("<div>Success Response</div>");
});
app.use(express.static(__dirname));

app.use("/html", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

server.listen("4040", () => {
  console.log("Server Started port = 4040");
});

mongoose
  .connect(
    "mongodb+srv://ak722872:Hello_World_123@ecommerce.z4cbg0g.mongodb.net/?retryWrites=true&w=majority&appName=ECommerce"
  )
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });
