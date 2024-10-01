"use strict";

const { CustomError } = require("../errors/customError");
const Conversation = require("../models/conversationModel");

const socketAuth = async (socket, next) => {
  const { conversationId, userId } = socket.handshake.auth;

  if (!conversationId || !userId) {
    return next(new CustomError("Invalid request", 400));
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(new CustomError("Conversation not found", 404));
  }

  const isParticipant =
    conversation.participantIds.includes(userId) ||
    conversation.createdBy.toString() === userId;
  if (!isParticipant) {
    return next(new Error("Access denied", 403));
  }

  socket.conversationId = conversationId;
  socket.userId = userId;
  next();
};

module.exports = socketAuth;
