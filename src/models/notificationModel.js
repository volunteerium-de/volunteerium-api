"use strict";

const { mongoose } = require("../configs/dbConnection");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: ["eventReminder", "eventUpdate", "eventJoinRequest", "scoreUpdate"],
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
