"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// token:
router.use("/tokens", require("./tokenRouter"));
// auth:
router.use("/auth", require("./authRouter"));
// user:
router.use("/users", require("./userRouter"));
// userDetails:
router.use("/details/users", require("./userDetailsRouter"));
// events:
router.use("/events", require("./eventRouter"));
// interests:
router.use("/interests", require("./interestRouter"));
// addresses:
router.use("/addresses", require("./addressRouter"));
// documents:
router.use("/documents", require("./documentRouter"));
// event-feedbacks:
router.use("/event-feedbacks", require("./eventFeedbackRouter"));
// notifications:
router.use("/notifications", require("./notificationRouter"));
// event-participants:
router.use("/event-participants", require("./eventParticipantRouter"));
// conversations:
router.use("/conversations", require("./conversationRouter"));
// messages:
router.use("/messages", require("./messageRouter"));
// event-reports:
router.use("/event-reports", require("./eventReportRouter"));
// contacts:
router.use("/contacts", require("./contactRouter"));
// documentations:
router.use("/documentations", require("./documentationRouter"));
// subscriptions:
router.use("/subscriptions", require("./subscriptionRouter"));
/* ------------------------------------------------------- */
module.exports = router;
