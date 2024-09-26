"use strict";

const router = require("express").Router();
const userDetailsController = require("../controllers/userDetailsController");
const validateUserFileUpload = require("../middlewares/fileUploadValidation");
const idValidation = require("../middlewares/idValidation");
const uploadFileBasedOnUserType = require("../middlewares/uploadFileBasedOnUserType");

// URL: /details/users

router.route("/").get(userDetailsController.list);
router
  .route("/:id")
  .all(idValidation)
  .get(userDetailsController.read)
  .put(
    uploadFileBasedOnUserType,
    validateUserFileUpload,
    userDetailsController.update
  )
  .patch(
    uploadFileBasedOnUserType,
    validateUserFileUpload,
    userDetailsController.update
  );

module.exports = router;
