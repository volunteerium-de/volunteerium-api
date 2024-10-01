"use strict";

const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

module.exports = {
  sendMessage: async (socket, data) => {
    const { content } = data;
    const { conversationId, userId } = socket;

    const message = new Message({ conversationId, senderId: userId, content });
    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messageIds: message._id },
    });

    socket.to(conversationId).emit("newMessage", message);
  },
  create: async (req, res) => {
    const { eventId, createdBy, title, description, photo, participantIds } =
      req.body;
    const conversation = new Conversation({
      eventId,
      createdBy,
      title,
      description,
      photo,
      participantIds,
    });

    await conversation.save();
    res.status(201).send({
      error: false,
      message: "New Conversation successfully created!",
      data: conversation,
    });
  },
  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const conversation = await Conversation.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({ error: false, new: conversation });
  },
  delete: async (req, res) => {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);

    // Delete all messages related to this conversation
    await Message.deleteMany({ conversationId: id });

    res.status(200).send({
      error: false,
      message: "Conversation and related messages deleted successfully",
    });
  },
};
