"use strict";

const { mongoose } = require("../configs/dbConnection");

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
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
