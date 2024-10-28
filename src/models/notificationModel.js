"use strict";

const { mongoose } = require("../configs/dbConnection");
const { getIoInstance } = require("../configs/socketInstance");
const { sendEmail } = require("../utils/email/emailService");
const {
  getNotificationAndMessageEmailHtml,
} = require("../utils/email/notification-message/notification-message");
const { notificationContentGenerator } = require("../utils/functions");
const User = require("../models/userModel");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentEN: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 250,
    },
    contentDE: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 250,
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
  const { en, de } = notificationContentGenerator(
    notificationType,
    eventTitle,
    badgeType
  );

  const notification = new this({
    userId,
    contentEN: en,
    contentDE: de,
    notificationType,
  });

  await notification.save();

  const unreadNotificationCount = await this.countDocuments({
    userId,
    isRead: false,
  });

  const user = await User.findById(userId);
  // Send email to user
  const emailSubject = `You have ${unreadNotificationCount} new notifications`;
  const emailHtml = getNotificationAndMessageEmailHtml(
    user.userType === "organization"
      ? user.organizationName
      : user.fullName.split(" ")[0],
    unreadNotificationCount > 1 ? "notifications" : "notification",
    unreadNotificationCount
  );

  await sendEmail(user.email, emailSubject, emailHtml);

  const newNotifications = await this.find({
    userId,
  }).sort({ createdAt: -1 });

  const io = getIoInstance();
  io.emit("receive_notifications", newNotifications);

  return notification;
};

module.exports = mongoose.model("Notification", NotificationSchema);
