"use strict";

const socketIo = require("socket.io");
const socketAuth = require("./src/middlewares/socketAuth");
const conversationController = require("./src/controllers/conversationController");
const { CLIENT_URL } = require("./setups");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.join(socket.conversationId);
    console.log(
      `User ${socket.userId} joined conversation: ${socket.conversationId}`
    );

    socket.on("sendMessage", (data) =>
      conversationController.sendMessage(socket, data)
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
