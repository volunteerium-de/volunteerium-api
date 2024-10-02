"use strict";

const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

module.exports = {
  sendMessage: async (socket, data) => {
    try {
      const { content } = data;
      const { conversationId, userId } = socket;

      const message = new Message({
        conversationId,
        senderId: userId,
        content,
      });
      await message.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        $push: { messageIds: message._id },
      });

      socket.to(conversationId).emit("newMessage", message);
    } catch (error) {
      console.error("Error sending message: ", error);
      socket.emit("error", { message: "Error sending message." });
    }
  },
  getMessages: async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).populate([
      {
        path: "senderId",
        select: "fullName organizationName",
        populate: { path: "userDetailsId", select: "avatar organizationLogo" },
      },
    ]);
    res.status(200).send({ error: false, data: messages });
  },
};
