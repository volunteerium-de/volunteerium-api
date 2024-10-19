"use strict";

const { mongoose } = require("../configs/dbConnection");

const EventReportSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportType: {
      type: String,
      enum: [
        "offensive",
        "harmful",
        "inappropriate",
        "misleading",
        "spam",
        "harassment",
        "fraud",
        "violence",
        "discrimination",
        "other",
      ],
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
  },
  {
    collection: "eventReports",
    timestamps: true,
  }
);

module.exports = mongoose.model("EventReport", EventReportSchema);
