"use strict";

const Event = require("../models/eventModel");

const checkExpiredEvents = async (req, res, next) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  await Event.updateMany(
    { startDate: { $gt: oneHourAgo }, isDone: false },
    { isDone: true }
  );
  next();
};

module.exports = checkExpiredEvents;
