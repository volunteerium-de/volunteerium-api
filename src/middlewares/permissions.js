"use strict";

const { CustomError } = require("../errors/customError");
const { NODE_ENV, ADMIN_ID } = require("../../setups");
const User = require("../models/userModel");
const UserDetails = require("../models/userDetailsModel");
const Event = require("../models/eventModel");
const EventParticipant = require("../models/eventParticipantModel");
const EventFeedback = require("../models/eventFeedbackModel");
const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

module.exports = {
  /* ---------------------------------- */
  /*             Auth / User            */
  /* ---------------------------------- */
  isLogin: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user) {
      return next();
    } else {
      throw new CustomError("NoPermission: You must be logged in!", 403);
    }
  },

  isActive: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user.isActive) {
      return next();
    } else {
      throw new CustomError("NoPermission: Inactive account!", 403);
    }
  },

  checkEmailVerification: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user.isEmailVerified) {
      return next();
    } else {
      throw new CustomError("NoPermission: Account not verified!", 403);
    }
  },

  isAdmin: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "admin") {
      return next();
    } else {
      throw new CustomError("NoPermission: You must be an Admin User.", 403);
    }
  },

  isIndividualUser: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "individual") {
      return next();
    } else {
      throw new CustomError(
        "NoPermission: You must be an Individual User.",
        403
      );
    }
  },

  isOrganization: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "organization") {
      return next();
    } else {
      throw new CustomError("NoPermission: You must be an Organization.", 403);
    }
  },

  isOrganizationOrAdmin: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (
      req.user?.userType?.toLowerCase() === "organization" ||
      req.user?.userType?.toLowerCase() === "admin"
    ) {
      return next();
    } else {
      throw new CustomError(
        "NoPermission: You must be an Organization or Admin.",
        403
      );
    }
  },

  isUserOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const user = await User.findById(req.params.id);

    if (
      String(user._id) === String(req.user._id) ||
      req.user.userType === "admin"
    ) {
      return next(); // User must be the owner of the user
    } else {
      throw new CustomError(
        "No Permission: Only user owner can view or edit their profile.",
        403
      );
    }
  },

  isUserDetailsOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const userDetails = await UserDetails.findById(req.params.id);
    if (
      String(userDetails.userId) === String(req.user._id) ||
      req.user.userType === "admin"
    ) {
      return next(); // User must be the owner of the userDetails
    } else {
      throw new CustomError(
        "No Permission: Only user owner can view or edit their profile details.",
        403
      );
    }
  },

  checkAdminUserType: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.body.userType !== "admin") {
      return next();
    } else {
      throw new CustomError("No Permission: Admin already exist!", 403);
    }
  },

  /* ---------------------------------- */
  /*                Event               */
  /* ---------------------------------- */
  canCreateEvent: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (
      req.user?.userType?.toLowerCase() === "individual" ||
      req.user?.userType?.toLowerCase() === "organization"
    ) {
      return next(); // Both Individual users and Organizations can create volunteering events
    } else {
      throw new CustomError(
        "NoPermission: Only Individual users or Organizations can create volunteering events.",
        403
      );
    }
  },

  isEventOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.params.id);
    if (
      req.user?.userType?.toLowerCase() === "admin" ||
      String(event.createdBy) === String(req.user._id)
    ) {
      return next(); // User must be the owner of the event or an admin
    } else {
      throw new CustomError("No Permission: Only event owner or admin.", 403);
    }
  },

  /* ---------------------------------- */
  /*           EventFeedback            */
  /* ---------------------------------- */
  canGiveFeedback: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    if (req.user.userType !== "individual") {
      throw new CustomError(
        "No Permission: Only Individual users can give feedback for events.",
        403
      );
    }

    const event = await Event.findById(req.body.eventId);
    if (event.eventParticipantIds.includes(req.user._id)) {
      return next(); // Participants of the event can give feedback
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to give feedback for this event.",
        403
      );
    }
  },

  isFeedbackOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    const eventFeedback = await EventFeedback.findById(req.params.id);
    if (
      req.user.userType === "admin" ||
      String(eventFeedback.userId) === String(req.user.id)
    ) {
      return next(); // Only event feedback owners and admin can manage their feedbacks
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to manage this feedback for this event.",
        403
      );
    }
  },

  /* ---------------------------------- */
  /*              Document              */
  /* ---------------------------------- */
  isDocumentOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    const event = await Event.findOne({
      $in: { documentIds: [req.params.id] },
    });
    const user = await User.findOne({
      $in: { documentIds: [req.params.id] },
    });
    if (req.user.userType === "admin") {
      return next();
    }

    if (event && String(event.createdBy) === String(req.user._id)) {
      return next();
    }
    if (user && String(user._id) === String(req.user._id)) {
      return next();
    }

    throw new CustomError(
      "NoPermission: You do not have permission to manage this document.",
      403
    );
  },

  // // Check if user has required interest for event
  // hasEventInterest: async (req, res, next) => {
  //   // if (!NODE_ENV) return next();
  //   const event = await Event.findById(req.params.id);
  //   const userInterests = req.user.interestIds || [];
  //   const eventInterests = event.interestIds || [];

  //   if (userInterests.some((interest) => eventInterests.includes(interest))) {
  //     return next();
  //   } else {
  //     throw new CustomError(
  //       "No Permission: You must have an interest matching the event.",
  //       403
  //     );
  //   }
  // },

  /* ---------------------------------- */
  /*               Message              */
  /* ---------------------------------- */
  canSendMessage: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (
      req.user?.userType?.toLowerCase() === "admin" ||
      String(req.user._id) === String(req.body.senderId)
    ) {
      next(); // Admins or the sender themselves can send messages
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to send messages.",
        403
      );
    }
  },

  isMessageOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const message = await Message.findById(req.params.id);
    if (
      req.user?.userType?.toLowerCase() === "admin" ||
      String(message.senderId) === String(req.user._id)
    ) {
      return next(); // User must be the sender of this message or an admin
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to manage this message.",
        403
      );
    }
  },

  /* ---------------------------------- */
  /*            Conversation            */
  /* ---------------------------------- */
  canConversationOwner: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    const event = await Event.findById(req.body.eventId);

    if (!event) {
      throw new CustomError("NoPermission: Event not found.", 404);
    }

    const isAdmin = req.user?.userType?.toLowerCase() === "admin";
    const isCreator = String(event.createdBy) === String(req.user._id);
    const participantCount = req.body.participantIds?.length || 0;

    if (!isAdmin && !isCreator) {
      if (participantCount === 1) {
        const isRelatedParticipant =
          event.eventParticipantIds.includes(String(event.createdBy)) ||
          event.eventParticipantIds.includes(String(ADMIN_ID));

        if (!isRelatedParticipant) {
          throw new CustomError(
            "NoPermission: You can only chat with admin or the related event owner!",
            403
          );
        }
      } else if (participantCount > 1) {
        throw new CustomError(
          "NoPermission: Only the event owner can create this conversation.",
          403
        );
      }
    }

    return next();
  },

  isConversationOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const conversation = await Conversation.findById(req.params.id);
    if (
      req.user?.userType?.toLowerCase() === "admin" ||
      String(conversation.createdBy) === String(req.user._id)
    ) {
      return next(); // User must be the owner of the conversation or an admin
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to manage this conversation.",
        403
      );
    }
  },

  canConversationParticipant: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      throw new CustomError("NoPermission: Event not found.", 404);
    }

    const { participantIds } = req.body;

    if (!participantIds || participantIds.length === 0) {
      throw new CustomError(
        "NoPermission: At least one participant is required!",
        403
      );
    }

    const isValidParticipant = participantIds.every(
      (participant) =>
        event.eventParticipantIds.includes(participant) ||
        String(participant) === String(event.createdBy) ||
        String(participant) === String(ADMIN_ID)
    );

    if (!isValidParticipant) {
      throw new CustomError(
        `NoPermission: All participants must be event participants, the event owner, or admin!`,
        403
      );
    }

    return next();
  },

  isConversationParticipant: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const conversation = await Conversation.findById(req.body.id);
    if (
      req.user?.userType?.toLowerCase() === "admin" ||
      conversation.participantIds.includes(req.user._id) ||
      String(conversation.createdBy) === String(req.user._id)
    ) {
      return next(); // User must be the participant or creator of the conversation or an admin
    } else {
      throw new CustomError(
        "NoPermission: You do not have permission to access this conversation",
        403
      );
    }
  },

  /* ---------------------------------- */
  /*              Address               */
  /* ---------------------------------- */
  addressOwnerOrAdmin: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const user = await UserDetails.findOne({ addressId: req.params.id });
    const event = await Event.findOne({ addressId: req.params.id });

    if (req.user?.userType?.toLowerCase() === "admin") {
      return next();
    }

    if (event && String(event.createdBy) === String(req.user._id)) {
      return next();
    }

    if (user && String(user.userId) === String(req.user._id)) {
      return next();
    }

    throw new CustomError(
      "No Permission: You do not have permission to manage this address.",
      403
    );
  },

  /* ---------------------------------- */
  /*          EventParticipant          */
  /* ---------------------------------- */
  checkMaxParticipant: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      throw new CustomError("No Permission: Event not found.", 404);
    }

    if (event.eventParticipantIds.length <= event.maxParticipant) {
      return next();
    } else {
      throw new CustomError(
        `NoPermission: This event has reached its maximum number of participants (${event.maxParticipant})`,
        403
      );
    }
  },

  canJoinEvent: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    const event = await Event.findById(req.body.eventId);
    const user = await User.findById(req.body.userId);

    if (!user) {
      throw new CustomError("No Permission: User not found.", 404);
    }

    const eventParticipant = await EventParticipant.findOne({
      userId: req.body.userId,
    });

    if (!eventParticipant) {
      return next(); // User can join the event
    }

    if (String(event.createdBy) === String(req.body.userId)) {
      throw new CustomError(
        "No Permission: You cannot join your own event.",
        403
      );
    }

    if (
      String(eventParticipant.eventId) === String(req.body.eventId) &&
      !eventParticipant.isPending &&
      !eventParticipant.isApproved &&
      !eventParticipant.hasJoined
    ) {
      throw new CustomError(
        "No Permission: You cannot join this event as you have not been approved yet.",
        403
      );
    }

    if (
      String(eventParticipant.eventId) === String(req.body.eventId) &&
      eventParticipant.hasJoined
    ) {
      throw new CustomError("You have already joined this event.", 403);
    }

    return next(); // User can join the event
  },

  canManageParticipants: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.body.eventId);
    const user = await User.findById(req.body.userId);

    if (!user) {
      throw new CustomError("No Permission: User not found.", 404);
    }

    if (!event) {
      throw new CustomError("No Permission: Event not found.", 404);
    }

    const isAdmin = req.user?.userType?.toLowerCase() === "admin";
    const isCreator = String(event.createdBy) === String(req.user._id);

    if (!isAdmin && !isCreator) {
      throw new CustomError(
        "No Permission: You do not have permission to manage this event.",
        403
      );
    }

    return next(); // Only event owner can manage the event participants
  },
};
