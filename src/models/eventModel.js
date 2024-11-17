"use strict";

const { mongoose } = require("../configs/dbConnection");
const fs = require("fs");
const path = require("path");
const { CustomError } = require("../errors/customError");
const translations = require("../../locales/translations");

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
      index: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      index: true,
    },
    interestIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
        index: true,
      },
    ],
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
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
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate && value && this.startDate < value;
        },
        message: "End date must be after start date.",
      },
      index: true,
    },
    languages: {
      type: [String],
      enum: languageCodes,
      index: true,
    },
    eventPhoto: {
      type: String,
      trim: true,
    },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
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
      index: true,
    },
    isDone: {
      type: Boolean,
      default: false,
      index: true,
    },
    maxParticipant: {
      type: Number,
      required: true,
      min: [1, "At least 1 Participant is required."],
    },
    eventParticipantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventParticipant",
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
  const t = this.translate;

  if (!this.isOnline && !this.addressId) {
    return next(new CustomError(t(translations.event.address), 404));
  }

  // Check if interestIds has minimum 1 and maximum 3 elements
  if (this.interestIds.length < 1) {
    return next(new CustomError(t(translations.event.interestMin), 404));
  }
  if (this.interestIds.length > 3) {
    return next(new CustomError(t(translations.event.interestMax), 404));
  }

  next();
});

// Pre-update hook for updateOne and findOneAndUpdate
EventSchema.pre(["updateOne", "findOneAndUpdate"], function (next, opts) {
  const update = this.getUpdate();
  const t = update.translate;

  // Validate address if the event is offline
  if (update.isOnline === false && !update.addressId) {
    return next(new CustomError(t(translations.event.address), 404));
  }

  // Validate interestIds length in the update operation
  if (update.interestIds) {
    if (update.interestIds.length < 1) {
      return next(new CustomError(t(translations.event.interestMin), 404));
    }
    if (update.interestIds.length > 3) {
      return next(new CustomError(t(translations.event.interestMax), 404));
    }
  }

  next();
});

// Custom save method to accept translation function
EventSchema.methods.customSave = function (t) {
  this.translate = t; // Add the translation function to the instance for later use
  return this.save();
};

// Custom update method to accept translation function
EventSchema.methods.customUpdate = function (update, options, t) {
  // Add translate to the options for validation
  if (t) {
    update.translate = t; // Store the translation function in the update object
  }

  return this.model("Event")
    .findOneAndUpdate({ _id: this._id }, update, {
      new: true,
      runValidators: true,
      ...options, // Ensure other options are passed along
    })
    .populate([
      {
        path: "createdBy",
        select: "userType email fullName organizationName",
        populate: {
          path: "userDetailsId",
          select:
            "avatar isFullNameDisplay organizationLogo organizationDesc organizationUrl",
        },
      },
      {
        path: "addressId",
      },
      {
        path: "interestIds",
        select: "name",
      },
      {
        path: "eventParticipantIds",
        populate: {
          path: "userId",
          select: "email fullName",
          populate: {
            path: "userDetailsId",
            select: "avatar isFullNameDisplay",
          },
        },
      },
      {
        path: "eventFeedbackIds",
        populate: {
          path: "userId",
          select: "email fullName",
          populate: {
            path: "userDetailsId",
            select: "avatar isFullNameDisplay",
          },
        },
      },
    ]);
};

module.exports = mongoose.model("Event", EventSchema);
