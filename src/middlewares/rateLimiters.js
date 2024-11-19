"use strict";

const rateLimit = require("express-rate-limit");
const { CustomError } = require("../errors/customError");
const translations = require("../../locales/translations");

const generalRateLimiterHandler = (req, res, next) => {
  const message = req.t(translations.limiter.general);
  next(new CustomError(message, 429));
};

const emailLimiterHandler = (req, res, next) => {
  const message = req.t(translations.limiter.email);
  next(new CustomError(message, 429));
};

module.exports = {
  generalRateLimiter: rateLimit({
    max: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
    handler: generalRateLimiterHandler,
  }),
  emailLimiter: rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24h
    max: 3, // max 3 emails from the same IP in 24h
    handler: emailLimiterHandler,
  }),
};
