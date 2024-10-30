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
const translations = require("../../locales/translations");

module.exports = {
  /* ---------------------------------- */
  /*             Auth / User            */
  /* ---------------------------------- */
  isLogin: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user) {
      return next();
    } else {
      throw new CustomError(req.t(translations.permission.isLogin), 403);
    }
  },

  isActive: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user.isActive) {
      return next();
    } else {
      throw new CustomError(req.t(translations.permission.isActive), 403);
    }
  },

  checkEmailVerification: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user.isEmailVerified) {
      return next();
    } else {
      throw new (req.t(translations.permission.checkEmailVerification), 403)();
    }
  },

  isAdmin: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "admin") {
      return next();
    } else {
      throw new CustomError(req.t(translations.permission.isAdmin), 403);
    }
  },

  isIndividualUser: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "individual") {
      return next();
    } else {
      throw new CustomError(
        req.t(translations.permission.isIndividualUser),
        403
      );
    }
  },

  isOrganization: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.user?.userType?.toLowerCase() === "organization") {
      return next();
    } else {
      throw new CustomError(req.t(translations.permission.isOrganization), 403);
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
        req.t(translations.permission.isOrganizationOrAdmin),
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
        req.t(translations.permission.isUserOwnerOrAdmin),
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
        req.t(translations.permission.isUserDetailsOwnerOrAdmin),
        403
      );
    }
  },

  checkAdminUserType: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (req.body.userType !== "admin") {
      return next();
    } else {
      throw new CustomError(
        req.t(translations.permission.checkAdminUserType),
        403
      );
    }
  },

  /* ---------------------------------- */
  /*                Event               */
  /* ---------------------------------- */

  isActiveEvent: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.params.id);
    if (event.isActive) {
      return next(); // Event is active
    } else {
      throw new CustomError(req.t(translations.permission.isActiveEvent), 403);
    }
  },

  canCreateEvent: (req, res, next) => {
    // if (!NODE_ENV) return next();
    if (
      req.user?.userType?.toLowerCase() === "individual" ||
      req.user?.userType?.toLowerCase() === "organization"
    ) {
      return next(); // Both Individual users and Organizations can create volunteering events
    } else {
      throw new CustomError(req.t(translations.permission.canCreateEvent), 403);
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
      throw new CustomError(
        req.t(translations.permission.isEventOwnerOrAdmin),
        403
      );
    }
  },

  /* ---------------------------------- */
  /*           EventFeedback            */
  /* ---------------------------------- */
  canGiveFeedback: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    if (req.user.userType !== "individual") {
      throw new CustomError(
        req.t(translations.permission.canGiveFeedback.individual),
        403
      );
    }

    const event = await Event.findById(req.body.eventId);
    if (event.eventParticipantIds.includes(req.user._id)) {
      return next(); // Participants of the event can give feedback
    } else {
      throw new CustomError(
        req.t(translations.permission.canGiveFeedback.notAllowed),
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
        req.t(translations.permission.isFeedbackOwnerOrAdmin),
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
      documentIds: { $in: [req.params.id] },
    });

    const user = await User.findOne({
      documentIds: { $in: [req.params.id] },
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
      req.t(translations.permission.isDocumentOwnerOrAdmin),
      403
    );
  },

  /* ---------------------------------- */
  /*               Message              */
  /* ---------------------------------- */
  canSendMessage: async (req, res, next) => {
    const conversation = await Conversation.findById(req.body.conversationId);
    if (!conversation) {
      throw new CustomError(
        req.t(translations.permission.canSendMessage.failed),
        404
      );
    }

    const event = await Event.findById(conversation.eventId);
    if (!event) {
      throw new CustomError(
        req.t(translations.permission.canSendMessage.failed),
        404
      );
    }

    const isAdmin = req.user?.userType?.toLowerCase() === "admin";
    const isEventOwner = String(req.user._id) === String(event.createdBy);
    const isConversationCreatedByEventOwner =
      String(conversation.createdBy) === String(event.createdBy);

    if (isAdmin || isEventOwner) {
      next(); // Admins or event owners can always send messages
    } else if (!isConversationCreatedByEventOwner) {
      next(); // Allow anyone to send messages in conversations not created by the event owner
    } else {
      throw new CustomError(
        req.t(translations.permission.canSendMessage.notAllowed),
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
        req.t(translations.permission.isMessageOwnerOrAdmin),
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
      throw new (req.t(translations.event.notFound), 404)();
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
            req.t(
              translations.permission.canConversationOwner.relatedParticipant
            ),
            403
          );
        }
      } else if (participantCount > 1) {
        throw new CustomError(
          req.t(translations.permission.canConversationOwner.participant),
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
        req.t(translations.permission.isConversationOwnerOrAdmin),
        403
      );
    }
  },

  canConversationParticipant: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      throw new CustomError(req.t(translations.event.notFound), 404);
    }

    const { participantIds } = req.body;

    if (participantIds) {
      const isValidParticipant = participantIds.every(
        (participant) =>
          event.eventParticipantIds.includes(participant) ||
          String(participant) === String(event.createdBy) ||
          String(participant) === String(ADMIN_ID)
      );

      if (!isValidParticipant) {
        throw new CustomError(
          req.t(translations.permission.canConversationParticipant.participant),
          403
        );
      }
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
        req.t(translations.permission.isConversationParticipant),
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
      req.t(translations.permission.addressOwnerOrAdmin),
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
      throw new CustomError("Event not found.", 404);
    }

    if (event.eventParticipantIds.length <= event.maxParticipant) {
      return next();
    } else {
      throw new CustomError(
        `${req.t(translations.permission.checkMaxParticipant.maxReached)} ${
          event.maxParticipant
        }`,
        403
      );
    }
  },

  canJoinEvent: async (req, res, next) => {
    // if (!NODE_ENV) return next();

    const event = await Event.findById(req.body.eventId);
    const user = await User.findById(req.body.userId);

    if (event.isActive) {
      throw new CustomError(
        req.t(translations.permission.canJoinEvent.eventActive),
        403
      );
    }

    if (event.isDone) {
      throw new CustomError(
        req.t(translations.permission.canJoinEvent.eventDone),
        403
      );
    }

    if (!user) {
      throw new CustomError(req.t(translations.user.notFound), 404);
    }

    const eventParticipant = await EventParticipant.findOne({
      userId: req.body.userId,
    });

    if (!eventParticipant) {
      return next(); // User can join the event
    }

    if (String(event.createdBy) === String(req.body.userId)) {
      throw new CustomError(
        req.t(translations.permission.canJoinEvent.eventOwner),
        403
      );
    }

    if (
      String(eventParticipant.eventId) === String(req.body.eventId) &&
      !eventParticipant.isPending &&
      !eventParticipant.isApproved &&
      eventParticipant.joinStatus !== "pending"
    ) {
      throw new CustomError(
        req.t(translations.permission.canJoinEvent.notApproved),
        403
      );
    }

    if (
      String(eventParticipant.eventId) === String(req.body.eventId) &&
      eventParticipant.joinStatus
    ) {
      throw new CustomError(
        req.t(translations.permission.canJoinEvent.alreadyJoined),
        403
      );
    }

    return next(); // User can join the event
  },

  canManageParticipants: async (req, res, next) => {
    // if (!NODE_ENV) return next();
    const event = await Event.findById(req.body.eventId);
    const user = await User.findById(req.body.userId);

    if (!user) {
      throw new CustomError(req.t(translations.user.notFound), 404);
    }

    if (!event) {
      throw new CustomError(req.t(translations.event.notFound), 404);
    }

    const isAdmin = req.user?.userType?.toLowerCase() === "admin";
    const isCreator = String(event.createdBy) === String(req.user._id);

    if (!isAdmin && !isCreator) {
      throw new CustomError(
        req.t(translations.permission.canManageParticipants),
        403
      );
    }

    return next(); // Only event owner can manage the event participants
  },
};
