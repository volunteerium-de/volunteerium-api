"use strict";

const { CustomError } = require("../errors/customError");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

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
    let customFilter = {};

    if (req.user) {
      if (req.user.userType === "admin") {
        customFilter.userId = req.body.userId;
      } else {
        customFilter.userId = req.user._id;
      }
    }

    const data = await res.getModelList(Notification, customFilter);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Notification, customFilter),
      data,
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
      message: "All unread notifications marked as read successfully",
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

    const data = await Notification.create(req.body);
    res.status(201).send({
      error: false,
      message: "New notification successfully created!",
      data,
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

    const data = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(202).send({
      error: false,
      message: "Notification updated successfully!",
      new: data,
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
        ? "Notification successfully deleted!"
        : "Notification not found!",
    });
  },
};
