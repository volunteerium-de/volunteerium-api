"use strict";

const jwt = require("jsonwebtoken");
const { CustomError } = require("../errors/customError");
const { ACCESS_KEY } = require("../../setups");

const socketAuth = (socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    console.error(
      `Socket Authentication Error: No token provided by Socket from ${socket.id}.`
    );
    return socket.disconnect();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    console.error(
      `Socket Authentication Error: Invalid token for socket ${socket.id}. Error:`,
      error.message
    );
    return next(new CustomError("Socket Authentication error", 403));
  }
};

module.exports = socketAuth;
