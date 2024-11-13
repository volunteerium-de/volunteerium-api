"use strict";

const { mongoose } = require("../configs/dbConnection");

const SubscriptionSchema = new mongoose.Schema(
  {
    email: {
      trim: true,
      type: String,
      unique: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "subscriptions",
  }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
