"use strict";

const router = require("express").Router();
const userDetailsController = require("../controllers/userDetailsController");
const { checkUserFileUpload } = require("../middlewares/fileUploadHandler");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isActive,
  checkEmailVerification,
  isUserDetailsOwnerOrAdmin,
} = require("../middlewares/permissions");
const uploadFileBasedOnUserType = require("../middlewares/uploadFileBasedOnUserType");

// URL: /details/users

router.use([isLogin, isActive, checkEmailVerification]);

router.route("/").get(userDetailsController.list);
router
  .route("/:id")
  .all(idValidation, isUserDetailsOwnerOrAdmin)
  .get(userDetailsController.read)
  .put(
    uploadFileBasedOnUserType,
    checkUserFileUpload,
    userDetailsController.update
  )
  .patch(
    uploadFileBasedOnUserType,
    checkUserFileUpload,
    userDetailsController.update
  );

module.exports = router;
