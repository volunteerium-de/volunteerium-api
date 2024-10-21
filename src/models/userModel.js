"use strict";
const { mongoose } = require("../configs/dbConnection");
const { CustomError } = require("../errors/customError");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: {
        values: ["admin", "individual", "organization"],
        message:
          "Invalid userType. Valid values are: admin, individual, organization.",
      },
      required: [true, "UserType is required."],
      immutable: true, // Once entered, userType cannot be changed again
    },
    googleId: {
      type: String,
    },
    userDetailsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
    },
    fullName: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { collection: "users", timestamps: true }
);

// Helper function to check required fields based on userType
function checkRequiredFields(userType, fullName, organizationName) {
  if (userType === "individual" && !fullName) {
    throw new CustomError("Full name is required for individual users.", 400);
  }
  if (userType === "organization" && !organizationName) {
    throw new CustomError(
      "Organization name is required for organization users.",
      400
    );
  }
}

// Pre-save middleware to check for required fields based on userType
userSchema.pre("save", function (next) {
  try {
    checkRequiredFields(this.userType, this.fullName, this.organizationName);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware to check for required fields based on userType
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const updateData = update.$set || update;
  const userType = this.getFilter().userType; // userType immutable

  try {
    checkRequiredFields(
      userType,
      updateData.fullName,
      updateData.organizationName
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema, "users");
