"use strict";

const router = require("express").Router();

const eventParticipantController = require("../controllers/eventParticipantController");
const idValidation = require("../middlewares/idValidation");
const {
  checkMaxParticipant,
  canJoinEvent,
  canManageParticipants,
  isAdmin,
  isLogin,
  isActive,
  checkEmailVerification,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /event-participants

router.use([isLogin, isActive, checkEmailVerification]);

router.get("/", eventParticipantController.list);

router.post(
  "/join",
  checkMaxParticipant,
  canJoinEvent,
  eventParticipantController.requestJoin
); // all users except event owner can send a join request
router.post(
  "/approve",
  canManageParticipants,
  eventParticipantController.approveParticipant
); // only event owner and admin can approve a join request
router.post(
  "/reject",
  canManageParticipants,
  eventParticipantController.rejectParticipant
); // only event owner and admin can reject a join request
router.post(
  "/confirm-attendance",
  canManageParticipants,
  eventParticipantController.confirmAttendance
); // only event owner or admin can confirm attendance of participants
router.post(
  "/confirm-absence",
  canManageParticipants,
  eventParticipantController.confirmAbsence
); // only event owner or admin can confirm attendance of participants

router.delete("/:id", idValidation, eventParticipantController.delete);

/* ------------------------------------------------------- */
module.exports = router;
