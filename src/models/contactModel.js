"use strict";

const { mongoose } = require("../configs/dbConnection");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100,
      minLength: 3,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address.",
      ],
    },
    subject: {
      type: String,
      trim: true,
      required: true,
      maxLength: 200,
      minLength: 3,
    },
    message: {
      type: String,
      trim: true,
      required: true,
      maxLength: 1000,
      minLength: 3,
    },
  },
  {
    collection: "contacts",
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", ContactSchema);
