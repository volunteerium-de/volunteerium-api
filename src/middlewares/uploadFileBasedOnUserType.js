"use strict";

const translations = require("../../locales/translations");
const { CustomError } = require("../errors/customError");
const { uploadSingleToS3, upload } = require("./awsS3Upload");

const uploadFileBasedOnUserType = (req, res, next) => {
  const validField =
    req.user.userType === "individual" || req.user.userType === "admin"
      ? "avatar"
      : "organizationLogo";

  // Multer setup for the valid field
  const uploadSingle = upload.single(validField);

  // Use the multer middleware for the valid field
  uploadSingle(req, res, async (err) => {
    if (err) {
      return next(
        new CustomError(
          `${req.t(translations.awsS3Upload.single.userType)} ${validField}`,
          400
        )
      );
    }

    // Proceed with the S3 upload if the file exists
    if (req.file) {
      try {
        await uploadSingleToS3(validField)(req, res, next);
      } catch (err) {
        return next(
          new CustomError(req.t(translations.awsS3Upload.upload), 500)
        );
      }
    } else {
      // If no file was uploaded, just move to the next middleware
      next();
    }
  });
};

module.exports = uploadFileBasedOnUserType;
