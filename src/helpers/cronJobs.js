"use strict";

const cron = require("node-cron");
const Event = require("../models/eventModel");
const {
  getReminderEmailHtml,
} = require("../utils/email/eventReminder/eventReminder");
const { sendEmail } = require("../utils/email/emailService");

module.exports = {
  reminderCronJob: cron.schedule("*/30 * * * *", async () => {
    console.log("Running cron job to check upcoming events...");

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const events = await Event.find({
      startDate: { $gte: now, $lte: oneHourLater },
    }).populate([
      {
        path: "eventParticipantIds",
        populate: { path: "userId", select: "email fullName" },
      },
      {
        path: "addressId",
      },
    ]);

    console.log("Found events:", events);

    for (const event of events) {
      for (const participant of event.eventParticipantIds) {
        if (participant) {
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
  }),
};
