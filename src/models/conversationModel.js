"use strict";

const { mongoose } = require("../configs/dbConnection");
const { CustomError } = require("../errors/customError");

const ConversationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 300,
    },
    photo: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/,
        "Invalid photo URL format",
      ],
    },
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messageIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    collection: "conversations",
    timestamps: true,
  }
);

// Pre-save hook to check for at least one additional participant
ConversationSchema.pre("save", function (next) {
  if (this.participantIds.length < 1) {
    return next(
      new CustomError(
        "At least one participant (besides createdBy) is required.",
        400
      )
    );
  }
  next();
});

module.exports = mongoose.model("Conversation", ConversationSchema);
