"use strict";

const { mongoose } = require("../configs/dbConnection");
const { getIoInstance } = require("../configs/socketInstance");
const { notificationContentGenerator } = require("../utils/functions");

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

NotificationSchema.statics.generate = async function (
  userId,
  notificationType,
  eventTitle,
  badgeType = ""
) {
  // Generate content based on notificationType
  const content = notificationContentGenerator(
    notificationType,
    eventTitle,
    badgeType
  );

  const notification = new this({
    userId,
    content,
    notificationType,
  });

  await notification.save();

  const newNotifications = await this.find({
    userId,
  }).sort({ createdAt: -1 });

  const io = getIoInstance();
  io.emit("receive_notifications", newNotifications);

  return notification;
};

module.exports = mongoose.model("Notification", NotificationSchema);
