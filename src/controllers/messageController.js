"use strict";

const Message = require("../models/messageModel");

module.exports = {
  getMessages: async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).populate(
      "senderId",
      "name"
    );
    res.status(200).json(messages);
  },
};
