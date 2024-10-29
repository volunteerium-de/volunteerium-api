"use strict";

const cron = require("node-cron");
const Event = require("../models/eventModel");
const {
  getReminderEmailHtml,
} = require("../utils/email/eventReminder/eventReminder");
const { sendEmail } = require("../utils/email/emailService");

module.exports = {
  reminderCronJob: cron.schedule("*/60 * * * *", async () => {
    console.log("Running cron job to check upcoming events...");

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // console.log("Current time (UTC):", now.toISOString());
    // console.log("One hour later (UTC):", oneHourLater.toISOString());

    try {
      // Set isDone true
      await Event.updateMany(
        {
          startDate: {
            $gte: now,
            $lte: oneHourLater,
          },
          isDone: false,
        },
        { isDone: true }
      );

      // Find them and populate
      const events = await Event.find({
        startDate: {
          $gte: now.toISOString(),
          $lte: oneHourLater.toISOString(),
        },
      }).populate([
        {
          path: "eventParticipantIds",
          populate: { path: "userId", select: "email fullName" },
        },
        {
          path: "addressId",
        },
      ]);

      // console.log("Found events:", events);

      for (const event of events) {
        for (const participant of event.eventParticipantIds) {
          if (participant) {
            console.log("Participant: ", participant);
            if (participant.isApproved) {
              const reminderSubject = `Reminder: Upcoming Event "${event.title}"`;
              const reminderEmailHtml = getReminderEmailHtml(
                participant.userId.fullName.split(" ")[0],
                event
              );

              await sendEmail(
                participant.userId.email,
                reminderSubject,
                reminderEmailHtml
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error finding events or sending emails:", error);
    }
  }),
};
