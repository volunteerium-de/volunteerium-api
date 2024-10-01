"use strict";

const { mongoose } = require("../configs/dbConnection");

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      immutable: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    file: {
      type: String,
      required: true,
    },
  },
  {
    collection: "documents",
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", DocumentSchema);
