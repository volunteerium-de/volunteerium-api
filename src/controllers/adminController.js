"use strict";

const {
  getResetDatabaseEmailHtml,
} = require("../utils/email/resetDatabase/resetDatabase");
const { generateResetDatabaseCode } = require("../helpers/tokenGenerator");
const { sendEmail } = require("../utils/email/emailService");
const { ADMIN_ID, ADMIN_EMAIL, RESET_DATABASE_KEY } = require("../../setups");
const jwt = require("jsonwebtoken");
const translations = require("../../locales/translations");

const models = {
  Event: require("../models/eventModel"),
  User: require("../models/userModel"),
  Interest: require("../models/interestModel"),
  Contact: require("../models/contactModel"),
  EventFeedback: require("../models/eventFeedbackModel"),
  EventReport: require("../models/eventReportModel"),
  Subscription: require("../models/subscriptionModel"),
  Address: require("../models/addressModel"),
  EventParticipant: require("../models/eventParticipantModel"),
  Conversation: require("../models/conversationModel"),
  Message: require("../models/messageModel"),
  Document: require("../models/documentModel"),
  Token: require("../models/tokenModel"),
  Notification: require("../models/notificationModel"),
  UserDetails: require("../models/userDetailsModel"),
};

module.exports = {
  // Fetch statistics for admin dashboard
  statistics: async (req, res) => {
    /*
      #swagger.tags = ['Statistics']
      #swagger.summary = 'Get statistics for admin panel'
      #swagger.description = 'Retrieve the count of users, events, addresses, interests, event participants, feedback, subscriptions, and other relevant statistics for the admin dashboard'
      #swagger.responses[200] = {
        description: 'Statistics retrieved successfully',
        schema: {
          error: false,
          data: {
            usersCount: 1000,
            eventsCount: 150,
            addressesCount: 200,
            interestsCount: 50,
            eventParticipantsCount: 500,
            eventFeedbackCount: 120,
            subscriptionsCount: 300,
            eventReportsCount: 50,
            conversationsCount: 1000,
            messagesCount: 2000,
            documentsCount: 150
          }
        }
      }
    */

    // Use Promise.all to run all count queries in parallel for better performance
    const statistics = await Promise.all(
      Object.entries(models)
        .filter(
          ([key]) =>
            key !== "Token" && key !== "Notification" && key !== "UserDetails"
        )
        .map(([key, model]) =>
          model.countDocuments({}).then((count) => ({ [`${key}`]: count }))
        )
    );

    // Combine the results into one object
    const result = statistics.reduce(
      (acc, current) => ({ ...acc, ...current }),
      {}
    );

    // Return statistics in response
    return res.status(200).send({
      error: false,
      data: result,
    });
  },
  resetDatabaseRequest: async (req, res) => {
    // Send 6-digit code to admin in order to reset the database
    const { resetCode, resetDatabaseToken } = generateResetDatabaseCode();

    if (!resetCode || !resetDatabaseToken) {
      return res.status(500).send({
        error: true,
        message: req.t(translations.resetDatabase.failed),
      });
    }

    // Send reset request email to admin
    const resetEmailSubject = "Database Reset Request!";
    const resetEmailHtml = getResetDatabaseEmailHtml(resetCode);
    await sendEmail(ADMIN_EMAIL, resetEmailSubject, resetEmailHtml);

    res.status(200).send({
      error: false,
      data: resetDatabaseToken,
      message: req.t(translations.resetDatabase.request),
    });
  },
  resetDatabase: async (req, res) => {
    /*
      #swagger.tags = ['Database']
      #swagger.summary = 'Reset the database'
      #swagger.description = 'Delete all data from all collections in the database and reset the auto-incrementing sequence'
      #swagger.responses[200] = {
        description: 'Database reset successfully',
        schema: {
          error: false
        }
      }
    */
    const { email, resetDatabaseToken, resetCode } = req.body;

    if (!resetDatabaseToken || !email || !resetCode) {
      return res.status(400).send({
        error: true,
        message: req.t(translations.resetDatabase.badRequest),
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetDatabaseToken, RESET_DATABASE_KEY);
    } catch (error) {
      return res.status(401).send({
        error: true,
        message: req.t(translations.resetDatabase.invalidToken),
      });
    }

    if (
      decoded.email !== email ||
      decoded.code !== resetCode ||
      decoded.userId !== req?.user?._id
    ) {
      return res.status(401).send({
        error: true,
        message: req.t(translations.resetDatabase.unauthorized),
      });
    }

    // Delete all data from all collections except admin account (User -_id- and UserDetails -userId- collections)
    await Promise.all(
      Object.keys(models).map(async (modelKey) => {
        const model = models[modelKey];

        if (modelKey === "User") {
          await model.deleteMany({
            _id: { $ne: ADMIN_ID },
          });
        } else if (modelKey === "UserDetails") {
          await model.deleteMany({
            userId: { $ne: ADMIN_ID },
          });
        } else {
          await model.deleteMany({});
        }
      })
    );

    res.status(200).send({
      error: false,
      message: req.t(translations.resetDatabase.success),
    });
  },
};
