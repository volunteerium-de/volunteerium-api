"use strict";

const { mongoose } = require("../configs/dbConnection");
const { CustomError } = require("../errors/customError");

const EventFeedbackSchema = new mongoose.Schema(
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
    feedback: {
      type: String,
      trim: true,
      required: true,
      maxlength: 300,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    collection: "eventFeedbacks",
    timestamps: true,
  }
);

// Unique index to ensure a user can join an event only once
EventFeedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Optional pre-save hook to check for uniqueness
EventFeedbackSchema.pre("save", async function (next) {
  try {
    const exists = await mongoose.models.EventFeedback.findOne({
      userId: this.userId,
      eventId: this.eventId,
    });
    if (exists) {
      return next(
        new CustomError(
          "This user has already given feedback about this event.",
          400
        )
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("EventFeedback", EventFeedbackSchema);
