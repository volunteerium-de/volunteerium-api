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
// event-participants:
router.use("/event-participants", require("./eventParticipantRouter"));

/* ------------------------------------------------------- */
module.exports = router;
