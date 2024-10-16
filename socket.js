"use strict";

const { setIoInstance } = require("./src/configs/socketInstance");
const socketAuth = require("./src/middlewares/socketAuth");

const socket = (io) => {
  io.use(socketAuth);

  setIoInstance(io);

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.user._id}`);

    socket.on("join_channel", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.user._id}`);
    });
  });
};

module.exports = socket;
