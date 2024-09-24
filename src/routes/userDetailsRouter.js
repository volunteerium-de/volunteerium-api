"use strict";

const router = require("express").Router();
const userDetailsController = require("../controllers/userDetailsController");
const { uploadSingleToS3, upload } = require("../middlewares/awsS3Upload");
const idValidation = require("../middlewares/idValidation");

// URL: /details/users

// Helper function to dynamically determine fieldname based on request body
const dynamicUpload = (req, res, next) => {
  let uploadFieldName = null;

  if (req.body.avatar) {
    uploadFieldName = "avatar";
  } else if (req.body.organizationLogo) {
    uploadFieldName = "organizationLogo";
  }

  if (uploadFieldName) {
    const uploadSingleMiddleware = upload.single(uploadFieldName);
    uploadSingleMiddleware(req, res, next);
  } else {
    next();
  }
};

router.route("/").get(userDetailsController.list);
router
  .route("/:id")
  // .all(idValidation)
  .get(userDetailsController.read)
  .put(dynamicUpload, uploadSingleToS3, userDetailsController.update)
  .patch(dynamicUpload, uploadSingleToS3, userDetailsController.update);

module.exports = router;
