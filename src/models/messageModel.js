"use strict";

const { mongoose } = require("../configs/dbConnection");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500,
    },
    readerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // documentIds: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Document",
    //   },
    // ],
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
