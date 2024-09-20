"use strict";
const { mongoose } = require("../configs/dbConnection");

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
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    isProfileSetup: {
      type: Boolean,
      default: false,
    },
    //   documentIds: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Document",
    //     },
    //   ],
  },
  { collection: "users", timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
