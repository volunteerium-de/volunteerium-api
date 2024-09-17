"use strict";
const { mongoose } = require("../configs/dbConnection");

const userSchema = new mongoose.Schema({
  usertype: {
    type: String,
    enum: ["admin", "user"],
    required: true,
    default: "user",
  },
  googleId: {
    type: String,
  },
  //   userDetailsId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "UserDetails",
  //     default: null,
  //   },
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
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSetup: {
    type: Boolean,
    default: false,
  },
  //   documentIds: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Document",
  //       default: [],
  //     },
  //   ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
