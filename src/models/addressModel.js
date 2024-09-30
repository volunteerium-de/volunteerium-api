"use strict";

const { mongoose } = require("../configs/dbConnection");

const AddressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
    },
    state: {
      type: String,
    },
    streetName: {
      type: String,
    },
    streetNumber: {
      type: String,
    },
    additional: {
      type: String,
    },
    iframeSrc: {
      type: String,
      default: null,
    },
  },
  {
    collection: "addresses",
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", AddressSchema);
