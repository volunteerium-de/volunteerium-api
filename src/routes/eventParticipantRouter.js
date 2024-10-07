"use strict";

const router = require("express").Router();

const eventParticipantController = require("../controllers/eventParticipantController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /event-participants

router.get("/", eventParticipantController.list);

router.post("/join", eventParticipantController.requestJoin); // all users except event owner can send a join request
router.post("/approve", eventParticipantController.approveParticipant); // only event owner can approve a join request
router.post("/reject", eventParticipantController.rejectParticipant); // only event owner can reject a join request
router.post(
  "/confirm-attendance",
  eventParticipantController.confirmAttendance
); // only event owner or admin can confirm attendance of participants

router.delete("/:id", idValidation, eventParticipantController.delete);

/* ------------------------------------------------------- */
module.exports = router;
