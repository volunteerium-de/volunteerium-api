"use strict";

const Event = require("../models/eventModel");

const checkExpiredEvents = async (req, res, next) => {
  const now = new Date();
  await Event.updateMany(
    { startDate: { $gt: now }, isActive: true },
    { isActive: false }
  );
  next();
};

module.exports = checkExpiredEvents;
