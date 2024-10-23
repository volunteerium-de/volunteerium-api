"use strict";

const { mongoose } = require("../configs/dbConnection");
const UserDetails = require("../models/userDetailsModel");
const { CustomError } = require("../errors/customError");

const EventParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      immutable: true,
    },
    isPending: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    hasJoined: {
      type: String,
      enum: ["pending", "joined", "notJoined"],
      default: "pending",
    },
  },
  {
    collection: "eventParticipants",
    timestamps: true,
  }
);

// Unique index to ensure a user can join an event only once
EventParticipantSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Helper function to check if a participant exists
const findAndValidateParticipant = async (userId, eventId) => {
  const participant = await mongoose.models.EventParticipant.findOne({
    userId,
    eventId,
  });
  if (!participant) {
    throw new CustomError(
      `User with ID ${userId} has not requested to join event with ID ${eventId}`,
      400
    );
  }
  return participant;
};

EventParticipantSchema.statics.requestJoin = async function (userId, eventId) {
  const participant = await mongoose.models.EventParticipant.findOne({
    userId,
    eventId,
  });
  if (participant) {
    throw new CustomError(
      `User with ID ${userId} has already joined this event.`,
      400
    );
  }

  const eventParticipant = new this({ userId, eventId });
  const savedParticipant = await eventParticipant.save();
  return savedParticipant;
};

EventParticipantSchema.statics.approveParticipant = async function (
  userId,
  eventId
) {
  const eventParticipant = await findAndValidateParticipant(userId, eventId);
  eventParticipant.isApproved = true;
  eventParticipant.isPending = false;
  eventParticipant.hasJoined = "pending";
  const updatedParticipant = await eventParticipant.save();
  return updatedParticipant;
};

EventParticipantSchema.statics.rejectParticipant = async function (
  userId,
  eventId
) {
  const eventParticipant = await findAndValidateParticipant(userId, eventId);
  eventParticipant.isPending = false;
  eventParticipant.isApproved = false;
  eventParticipant.hasJoined = "pending";
  const updatedParticipant = await eventParticipant.save();
  return updatedParticipant;
};

EventParticipantSchema.statics.confirmAttendance = async function (
  userId,
  eventId
) {
  const eventParticipant = await findAndValidateParticipant(userId, eventId);

  if (eventParticipant.hasJoined === "joined") {
    throw new CustomError(
      `User with ID ${userId} has already confirmed attendance for this event.`,
      400
    );
  }

  if (!eventParticipant.isApproved) {
    throw new CustomError(
      `User with ID ${userId} is not approved to join this event.`,
      400
    );
  }

  const userDetails = await UserDetails.findOne({ userId });
  if (!userDetails) {
    throw new CustomError(
      `User Details not found for this User with ID ${userId}.`,
      404
    );
  }

  // Mark user as joined
  eventParticipant.hasJoined = "joined";
  const updatedParticipant = await eventParticipant.save();

  // Increase user points
  userDetails.totalPoint = (userDetails.totalPoint || 0) + 10;
  await userDetails.save();

  return updatedParticipant;
};

EventParticipantSchema.statics.confirmAbsence = async function (
  userId,
  eventId
) {
  const eventParticipant = await findAndValidateParticipant(userId, eventId);

  if (eventParticipant.hasJoined === "notJoined") {
    throw new CustomError(
      `User with ID ${userId} has already confirmed not joining for this event.`,
      400
    );
  }

  if (!eventParticipant.isApproved) {
    throw new CustomError(
      `User with ID ${userId} is not approved to join this event.`,
      400
    );
  }

  // Mark user as not joined
  eventParticipant.hasJoined = "notJoined";
  const updatedParticipant = await eventParticipant.save();

  return updatedParticipant;
};

module.exports = mongoose.model("EventParticipant", EventParticipantSchema);
