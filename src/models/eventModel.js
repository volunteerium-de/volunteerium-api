"use strict";

const { mongoose } = require("../configs/dbConnection");
const fs = require("fs");
const path = require("path");
const { CustomError } = require("../errors/customError");

const languagesData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../helpers/ISO-639-1-languages.json"),
    "utf8"
  )
);

const countryDialCodes = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../helpers/country_dial.json"),
    "utf8"
  )
);

const phoneRegex = /^\+\d{1,4} \d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const languageCodes = languagesData.map((lang) => lang.code);

const EventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    interestIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
        // required: true,
      },
    ],
    contactName: {
      type: String,
      trim: true,
      required: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: function (value) {
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },
    contactPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!phoneRegex.test(value)) {
            return false;
          }

          const countryCode = value.split(" ")[0];

          const isValidCountryCode = countryDialCodes.some(
            (country) => country.dial_code === countryCode
          );

          return isValidCountryCode;
        },
        message: "Invalid phone number format or country code.",
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate < value;
        },
        message: "End date must be after start date.",
      },
    },
    languages: {
      type: [String],
      enum: languageCodes,
    },
    eventPhoto: {
      type: String,
      trim: true,
    },
    // documentIds: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Document",
    //   },
    // ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    isRepeat: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxParticipant: {
      type: Number,
      required: true,
      min: [1, "Max participant must be at least 1."],
    },
    eventParticipantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eventFeedbackIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventFeedback",
      },
    ],
  },
  {
    collection: "events",
    timestamps: true,
  }
);

// Pre-save hook to validate addressId based on isOnline
EventSchema.pre("save", function (next) {
  if (!this.isOnline && !this.addressId) {
    return next(
      new CustomError("Address is required if the event is not online.")
    );
  }
  next();
});

// Pre-update hook for updateOne and findOneAndUpdate
EventSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  const update = this.getUpdate();

  if (update.isOnline === false && !update.addressId) {
    return next(
      new CustomError("Address is required if the event is not online.")
    );
  }
  next();
});

module.exports = mongoose.model("Event", EventSchema);
