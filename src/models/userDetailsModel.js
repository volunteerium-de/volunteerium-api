"use strict";
const { mongoose } = require("../configs/dbConnection");
const fs = require("fs");
const path = require("path");
const { CustomError } = require("../errors/customError");
const { isEmpty } = require("../utils/functions");

const languagesData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../helpers/ISO-639-1-languages.json"),
    "utf8"
  )
);

const languageCodes = languagesData.map((lang) => lang.code);

const userDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isFullNameDisplay: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "n/a"],
      trim: true,
    },
    ageRange: {
      type: String,
      enum: ["16-25", "26-35", "35+"],
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    languages: {
      type: [String],
      enum: languageCodes,
    },
    avatar: {
      type: String,
      trim: true,
    },
    totalPoint: {
      type: Number,
      default: 0,
      min: [0, "Total point cannot be negative"],
    },
    // interestIds: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Interest",
    //   },
    // ],
    organizationName: {
      type: String,
      trim: true,
    },
    organizationLogo: {
      type: String,
      trim: true,
    },
    organizationDesc: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    organizationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid URL format.",
      },
    },
    // addressId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Address",
    // },
  },
  { collection: "userDetails", timestamps: true }
);

// Pre-update middleware to validate required fields based on userType
userDetailsSchema.pre("findOneAndUpdate", async function (next) {
  // Fetch the User associated with this UserDetails
  const user = await mongoose
    .model("User")
    .findById(this._conditions.userId)
    .exec();

  if (!user) {
    return next(new CustomError("Associated user not found", 404));
  }

  // Get the update object
  const update = this.getUpdate();

  // Check userType and validate fields
  if (user.userType === "organization") {
    const requiredFields = {
      organizationName: "organizationName is required for organizations",
      organizationDesc: "organizationDesc is required for organizations",
      organizationLogo: "organizationLogo is required for organizations",
      addressId: "addressId is required for organizations",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (isEmpty(update[field])) {
        return next(new CustomError(message, 400));
      }
    }
  }

  next();
});

module.exports = mongoose.model(
  "UserDetails",
  userDetailsSchema,
  "userDetails"
);