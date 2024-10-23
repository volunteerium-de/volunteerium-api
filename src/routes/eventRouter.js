"use strict";

const router = require("express").Router();
const eventController = require("../controllers/eventController");
const { uploadSingleToS3, upload } = require("../middlewares/awsS3Upload");
const checkExpiredEvents = require("../middlewares/checkExpiredEvents");
const { checkEventPhotoUpload } = require("../middlewares/fileUploadHandler");
const idValidation = require("../middlewares/idValidation");
const {
  canCreateEvent,
  isLogin,
  isActive,
  checkEmailVerification,
  isEventOwnerOrAdmin,
} = require("../middlewares/permissions");

// URL: /events

router
  .route("/")
  .get(checkExpiredEvents, eventController.list)
  .post(
    isLogin,
    isActive,
    checkEmailVerification,
    canCreateEvent,
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    eventController.create
  );

router.route("/participant/:id").get(eventController.listParticipatedEvents);
router.route("/languages").get(eventController.listEventLanguages);

router
  .route("/:id")
  .all(idValidation)
  .get(eventController.read)
  .put(
    isLogin,
    isActive,
    checkEmailVerification,
    isEventOwnerOrAdmin,
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    checkEventPhotoUpload,
    eventController.update
  )
  .patch(
    isLogin,
    isActive,
    checkEmailVerification,
    isEventOwnerOrAdmin,
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    checkEventPhotoUpload,
    eventController.update
  )
  .delete(
    isLogin,
    isActive,
    checkEmailVerification,
    isEventOwnerOrAdmin,
    eventController.delete
  );

module.exports = router;
