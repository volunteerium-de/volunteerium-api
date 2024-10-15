"use strict";

const { CustomError } = require("../errors/customError");

let io;

const setIoInstance = (ioInstance) => {
  io = ioInstance;
};

const getIoInstance = () => {
  if (!io) {
    throw new CustomError("Socket.io instance has not been initialized", 400);
  }
  return io;
};

module.exports = {
  setIoInstance,
  getIoInstance,
};
