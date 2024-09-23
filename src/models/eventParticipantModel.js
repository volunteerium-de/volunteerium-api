"use strict";

const { mongoose } = require("../configs/dbConnection");

const EventParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    hasJoined: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "eventParticipants",
    timestamps: true,
  }
);

// Unique index to ensure a user can join an event only once
EventParticipantSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Optional pre-save hook to check for uniqueness
EventParticipantSchema.pre("save", async function (next) {
  try {
    const exists = await mongoose.models.EventParticipant.findOne({
      userId: this.userId,
      eventId: this.eventId,
    });
    if (exists) {
      return next(new CustomError("User has already joined this event.", 400));
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("EventParticipant", EventParticipantSchema);
