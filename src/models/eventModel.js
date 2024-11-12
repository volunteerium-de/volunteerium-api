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
          return this.startDate < value;
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
EventSchema.pre("save", function (next, opts) {
  const { t } = opts;

  if (this.isOnline && !this.addressId) {
    return next(
      new CustomError("Address is required if the event is not online.")
    );
  }

  // Check if interestIds has minimum 1 and maximum 3 elements
  if (this.interestIds.length < 1) {
    return next(new CustomError("At least one interest is required."));
  }
  if (this.interestIds.length > 3) {
    return next(new CustomError("You can select up to 3 interests only."));
  }

  next();
});

// Pre-update hook for updateOne and findOneAndUpdate
EventSchema.pre(["updateOne", "findOneAndUpdate"], function (next, opts) {
  const { t } = opts;

  const update = this.getUpdate();

  // Validate address if the event is offline
  if (update.isOnline === false && !update.addressId) {
    return next(
      new CustomError("Address is required if the event is not online.")
    );
  }

  // Validate interestIds length in the update operation
  if (update.interestIds) {
    if (update.interestIds.length < 1) {
      return next(new CustomError("At least one interest is required."));
    }
    if (update.interestIds.length > 3) {
      return next(new CustomError("You can select up to 3 interests only."));
    }
  }

  next();
});

// Custom save method to accept translation function
EventSchema.methods.customSave = function (t) {
  return this.save({ t });
};

// Custom update method to accept translation function
EventSchema.methods.customUpdate = function (update, options, translate) {
  // Add translate to the options for validation
  if (translate) {
    update.translate = translate;
  }

  return this.model("Event")
    .findOneAndUpdate({ _id: this._id }, update, {
      new: true,
      runValidators: true,
      ...options, // Ensure other options are passed along
    })
    .populate("addressId");
};

module.exports = mongoose.model("Event", EventSchema);
