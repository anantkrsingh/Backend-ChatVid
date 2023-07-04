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
const io = socketIO(server);

env.config();
const authRoutes = require("./Routes/Auth");
const roomRoutes = require("./Routes/Generator");
const sessionRoutes = require("./Routes/Session");
const { createMeeting } = require("./Controllers/Generator");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
io.on("connection", (socket) => {
  console.log("Client Connected");

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log(msg);
  });
});
app.use("/api", authRoutes);
app.use("/api/meeting", roomRoutes);

app.use("/api/session", sessionRoutes);

app.get("/", (req, res) => {
  res.send("<div>Success</div>")
});

server.listen("4040", () => {
  console.log("Server Started port = 4040");
});

mongoose
  .connect(process.env.MONGOOSE_URI)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });
