"use strict";

const UserDetails = require("../models/userDetailsModel");
const { CustomError } = require("../errors/customError");
const { deleteObjectByDateKeyNumber } = require("../helpers/deleteFromAwsS3");
const { extractDateNumber } = require("../utils/functions");

const validateUserFileUpload = async (req, res, next) => {
  const userDetails = await UserDetails.findOne({ _id: req.params.id });

  if (!userDetails) {
    throw new CustomError("User details not found", 404);
  }

  const validField =
    req.user.userType === "individual" ? "avatar" : "organizationLogo";

  // Check if there are no uploaded files, check existing fields for deletion
  if (!req.file) {
    if (userDetails[validField] && req.body[validField] === "") {
      const identifierForImage = extractDateNumber(userDetails[validField]);
      console.log(
        `Deleting existing ${validField} from S3 due to empty request body`
      );
      await deleteObjectByDateKeyNumber(identifierForImage);
    }
    return next(); // No files uploaded, proceed to the next middleware
  }

  // Handle file upload for valid field
  if (req.fileLocation) {
    // console.log("fileLocation", req.fileLocation);
    if (userDetails[validField]) {
      const identifierForImage = extractDateNumber(userDetails[validField]);
      console.log(`Deleting existing ${validField} from S3`);
      await deleteObjectByDateKeyNumber(identifierForImage);
    }
    req.body[validField] = req.fileLocation; // Assign new file location to the relevant field
  }

  next(); // Proceed to the next middleware
};

module.exports = validateUserFileUpload;
