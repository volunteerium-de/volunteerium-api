"use strict";

const router = require("express").Router();
const eventController = require("../controllers/eventController");
const { uploadSingleToS3, upload } = require("../middlewares/awsS3Upload");
const { checkEventPhotoUpload } = require("../middlewares/fileUploadHandler");
const idValidation = require("../middlewares/idValidation");

// URL: /events

router
  .route("/")
  .get(eventController.list)
  .post(
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    eventController.create
  );

router
  .route("/:id")
  .all(idValidation)
  .get(eventController.read)
  .put(
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    checkEventPhotoUpload,
    eventController.update
  )
  .patch(
    upload.single("eventPhoto"),
    uploadSingleToS3("eventPhoto"),
    checkEventPhotoUpload,
    eventController.update
  )
  .delete(eventController.delete);

module.exports = router;
