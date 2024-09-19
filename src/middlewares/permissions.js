// "use strict";

// const { CustomError } = require("../errors/customError");
// const { NODE_ENV } = require("../../setups");
// const User = require("../models/userModel");
// const Event = require("../models/eventModel");
// const EventParticipant = require("../models/eventParticipantModel");
// const EventFeedback = require("../models/eventFeedbackModel");
// const Interest = require("../models/interestModel");
// const Notification = require("../models/notificationModel");
// const Message = require("../models/messageModel");
// const Conversation = require("../models/conversationModel");

// module.exports = {
//   isLogin: (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (req.user && req.user.isActive) {
//       next();
//     } else {
//       throw new CustomError("NoPermission: You must be logged in.", 403);
//     }
//   },
//   isAdmin: (req, res, next) => {
//     if (!NODE_ENV) return next();
//     if (req.user && req.user?.userType?.toLowerCase() === "admin") {
//       next();
//     } else {
//       throw new CustomError("NoPermission: You must be an Admin.", 403);
//     }
//   },
//   isIndividualUser: (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (req.user && req.user?.userType?.toLowerCase() === "individual") {
//       next();
//     } else {
//       throw new CustomError(
//         "NoPermission: You must be an Individual User.",
//         403
//       );
//     }
//   },
//   isOrganization: (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (req.user && req.user?.userType?.toLowerCase() === "organization") {
//       next();
//     } else {
//       throw new CustomError("NoPermission: You must be an Organization.", 403);
//     }
//   },
//   isOrganizationOrAdmin: (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (
//       req.user &&
//       (req.user?.userType?.toLowerCase() === "organization" ||
//         req.user?.userType?.toLowerCase() === "admin")
//     ) {
//       next();
//     } else {
//       throw new CustomError(
//         "NoPermission: You must be an Organization or Admin.",
//         403
//       );
//     }
//   },
//   canManageEvent: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     if (req.user?.userType?.toLowerCase() === "admin") {
//       next(); // Admin can manage any event
//     } else if (
//       req.user?.userType?.toLowerCase() === "organization" &&
//       String(event.createdBy._id) === String(req.user._id)
//     ) {
//       next(); // Organization can manage their own events
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to manage this event.",
//         403
//       );
//     }
//   },
//   canAccessEvent: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     if (
//       req.user?.userType?.toLowerCase() === "individual" &&
//       req.user?.userType?.toLowerCase() === "admin"
//     ) {
//       next(); // Admin and individual users can access any event
//     } else if (
//       req.user?.userType?.toLowerCase() === "organization" &&
//       String(event.createdBy._id) === String(req.user._id)
//     ) {
//       next(); // Organization can access their own events
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to access this event.",
//         403
//       );
//     }
//   },
//   canCreateVolunteeringEvent: (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (
//       req.user?.userType?.toLowerCase() === "individual" ||
//       req.user?.userType?.toLowerCase() === "organization"
//     ) {
//       next(); // Both Individual users and Organizations can create volunteering events
//     } else {
//       throw new CustomError(
//         "NoPermission: Only Individual users or Organizations can create volunteering events.",
//         403
//       );
//     }
//   },

//   canAccessUserDetails: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const user = await User.findById(req.params.id);
//     if (
//       req.user?.userType?.toLowerCase() === "admin" ||
//       String(user._id) === String(req.user._id)
//     ) {
//       next(); // Admins or the user themselves can access user details
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to access these user details.",
//         403
//       );
//     }
//   },

//   isEventOwnerOrAdmin: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     if (
//       req.user?.userType?.toLowerCase() === "admin" ||
//       String(event.createdBy._id) === String(req.user._id)
//     ) {
//       next(); // User must be the owner of the event or an admin
//     } else {
//       throw new CustomError("No Permission: Only event owner or admin.", 403);
//     }
//   },

//   isEventParticipant: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     const isParticipant = event.participants.includes(req.user._id);
//     if (isParticipant) {
//       next(); // Admins or the participant themselves can access event participation details
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to access this event participant's details.",
//         403
//       );
//     }
//   },

//   canGiveFeedback: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     if (event.participants.includes(req.user._id)) {
//       next(); // Participants of the event can give feedback
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to give feedback for this event.",
//         403
//       );
//     }
//   },

//   canManageInterest: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const interest = await Interest.findOne({
//       userId: req.user._id,
//       eventId: req.params.eventId,
//     });
//     if (interest && String(interest.userId) === String(req.user._id)) {
//       next(); // Users who have shown interest can manage their interest
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to manage this interest.",
//         403
//       );
//     }
//   },

//   // Check if user has required interest for event
//   hasEventInterest: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const event = await Event.findById(req.params.id);
//     const userInterests = req.user.interests || [];
//     const eventInterests = event.interests || [];

//     if (userInterests.some((interest) => eventInterests.includes(interest))) {
//       next();
//     } else {
//       throw new CustomError(
//         "No Permission: You must have an interest matching the event.",
//         403
//       );
//     }
//   },

//   canViewNotifications: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const notifications = await Notification.find({ userId: req.user._id });
//     if (notifications) {
//       next(); // Users can view their own notifications
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to view notifications.",
//         403
//       );
//     }
//   },

//   canSendMessage: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     if (
//       req.user?.userType?.toLowerCase() === "admin" ||
//       String(req.user._id) === String(req.body.senderId)
//     ) {
//       next(); // Admins or the sender themselves can send messages
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to send messages.",
//         403
//       );
//     }
//   },

//   isConversationOwnerOrAdmin: async (req, res, next) => {
//     // if (!NODE_ENV) return next();
//     const conversation = await Conversation.findById(req.params.id);
//     if (
//       req.user?.userType?.toLowerCase() === "admin" ||
//       String(conversation.createdBy._id) === String(req.user._id)
//     ) {
//       next(); // User must be the owner of the conversation or an admin
//     } else {
//       throw new CustomError(
//         "NoPermission: You do not have permission to manage this conversation.",
//         403
//       );
//     }
//   },
// };
