"use strict";

const translations = require("../../locales/translations");
const { getIoInstance } = require("../configs/socketInstance");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { sendEmail } = require("../utils/email/emailService");
const {
  getNotificationAndMessageEmailHtml,
} = require("../utils/email/notification-message/notification-message");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Get all notifications for a user'
      #swagger.description = `Retrieve all notifications for the authenticated user.
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[content]=value1</b></li>
          <li>URL/?<b>sort[createdAt]=1&sort[notificationType]=-1</b></li>
          <li>URL/?<b>page=2&limit=10</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of notifications retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'notification-id', userId: 'user-id', content: 'Notification content', notificationType: 'eventReminder', isRead: true }]
        }
      }
    */
    const userId = req.user._id;

    // Fetch all unread notifications
    const unreadNotifications = await Notification.find({
      userId: userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    // Fetch the latest 10 read notifications
    const readNotifications = await Notification.find({
      userId: userId,
      isRead: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Combine both unread and read notifications
    const notifications = [...unreadNotifications, ...readNotifications];

    res.status(200).send({
      error: false,
      data: notifications,
    });
  },
  markAllAsRead: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Mark all notifications as read for a user'
      #swagger.description = 'Mark all unread notifications as read for the authenticated user'
      #swagger.responses[200] = {
        description: 'All notifications marked as read successfully',
        schema: {
          error: false,
          message: 'All unread notifications marked as read successfully'
        }
      }
    */

    await Notification.updateMany(
      { userId: req.user._id },
      { $set: { isRead: true } }
    );

    res.status(200).send({
      error: false,
      message: req.t(translations.notification.markAllAsRead),
      data: await Notification.find({
        userId: req.user._id,
      })
        .sort({ createdAt: -1 })
        .limit(10),
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Create a new notification'
      #swagger.description = 'Create a new notification and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $content: 'Notification content',
          $notificationType: 'eventReminder',
        }
      }
      #swagger.responses[201] = {
        description: 'Notification created successfully',
        schema: {
          error: false,
          message: "New notification successfully created!",
          data: { _id: 'notification-id', userId: 'user-id', content: 'Notification content', notificationType: 'eventReminder', isRead: false }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Validation errors'
        }
      }
    */
    const { content, userId, notificationType } = req.body;

    const notification = new Notification({
      userId,
      notificationType,
      content,
    });
    await notification.save();

    const newNotifications = await Notification.find({
      userId,
    }).sort({ createdAt: -1 });

    const io = getIoInstance();
    io.emit("receive_notifications", newNotifications);

    const user = await User.findById(userId);
    const unreadNotificationCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    // Send email to user
    const emailSubject = `You have ${unreadNotificationCount} new notifications`;
    const emailHtml = getNotificationAndMessageEmailHtml(
      user.fullName.split(" ")[0],
      unreadNotificationCount > 1 ? "notifications" : "notification",
      unreadNotificationCount
    );

    await sendEmail(user.email, emailSubject, emailHtml);

    res.status(201).send({
      error: false,
      message: req.t(translations.notification.create),
      data: notification,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Get a notification by ID'
      #swagger.description = 'Retrieve a specific notification by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Notification ID'
      }
      #swagger.responses[200] = {
        description: 'Notification retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'notification-id', userId: 'user-id', content: 'Notification content', notificationType: 'eventReminder', isRead: true }
        }
      }
      #swagger.responses[404] = {
        description: 'Notification not found',
        schema: {
          error: true,
          message: 'Notification not found'
        }
      }
    */
    const data = await Notification.findOne({ _id: req.params.id });
    res.status(200).send({
      error: false,
      data,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Update an existing notification'
      #swagger.description = 'Update the details of an existing notification by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Notification ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $content: 'Updated notification content',
          $notificationType: 'eventReminder',
          $isRead: true,
        }
      }
      #swagger.responses[202] = {
        description: 'Notification updated successfully',
        schema: {
          error: false,
          message: 'Notification updated successfully',
          data: { _id: 'notification-id', userId: 'user-id', content: 'Updated notification content', notificationType: 'eventReminder', isRead: true }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Validation errors'
        }
      }
      #swagger.responses[404] = {
        description: 'Notification not found',
        schema: {
          error: true,
          message: 'Notification not found'
        }
      }
    */

    const { content, notificationType } = req.body;
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { content, notificationType },
      { new: true }
    );

    const newNotifications = await Notification.find({
      userId: updatedNotification.userId,
    }).sort({ createdAt: -1 });

    const io = getIoInstance();
    io.emit("receive_notifications", newNotifications);

    res.status(202).send({
      error: false,
      message: req.t(translations.notification.update),
      new: updatedNotification,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Notification']
      #swagger.summary = 'Delete a notification by ID'
      #swagger.description = 'Delete a specific notification by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Notification ID'
      }
      #swagger.responses[204] = {
        description: 'Notification deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Notification not found',
        schema: {
          error: true,
          message: 'Notification not found!'
        }
      }
    */
    const data = await Notification.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? req.t(translations.notification.delete)
        : req.t(translations.notification.notFound),
    });
  },
};
