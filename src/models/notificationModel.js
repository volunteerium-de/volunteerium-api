"use strict";

const { mongoose } = require("../configs/dbConnection");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 200,
    },
    notificationType: {
      type: String,
      enum: [
        "eventReminder",
        "eventUpdate",
        "eventJoinRequest",
        "eventApproveParticipant",
        "eventCancellation",
        "confirmEventParticipants",
        "scoreUpdate",
        "badgeUpdate",
        "eventFeedbackRequest",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "notifications",
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
