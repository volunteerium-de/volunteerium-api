"use strict";

const { mongoose } = require("../configs/dbConnection");

const InterestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    nameDE: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
  },
  {
    collection: "interests",
    timestamps: true,
  }
);

module.exports = mongoose.model("Interest", InterestSchema);
