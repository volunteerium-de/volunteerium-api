"use strict";

const UserDetails = require("../models/userDetailsModel");
const Event = require("../models/eventModel");
const Document = require("../models/documentModel");
const { deleteObjectByDateKeyNumber } = require("../helpers/deleteFromAwsS3");
const { extractDateNumber } = require("../utils/functions");

const handleS3FileDeletionAndAssignment = async (
  modelData,
  field,
  fileLocation,
  body
) => {
  if (modelData[field]) {
    const identifierForImage = extractDateNumber(modelData[field]);
    // console.log(`Deleting existing ${field} from S3`);
    await deleteObjectByDateKeyNumber(identifierForImage);
  }

  if (fileLocation) {
    body[field] = fileLocation;
  }
};

const checkUserFileUpload = async (req, res, next) => {
  const userDetails = await UserDetails.findOne({ _id: req.params.id });

  const validField =
    req.user.userType === "individual" ? "avatar" : "organizationLogo";

  // Check if there are no uploaded files, check existing fields for deletion
  if (!req.file) {
    if (userDetails[validField] && req.body[validField] === "") {
      await handleS3FileDeletionAndAssignment(userDetails, validField);
    }
    return next(); // No files uploaded, proceed to the next middleware
  }

  // Handle file upload for valid field
  await handleS3FileDeletionAndAssignment(
    userDetails,
    validField,
    req.fileLocation,
    req.body
  );

  next(); // Proceed to the next middleware
};

const checkEventPhotoUpload = async (req, res, next) => {
  const event = await Event.findOne({ _id: req.params.id });

  const validField = "eventPhoto";

  if (!req.file) {
    if (event[validField] && req.body[validField] === "") {
      await handleS3FileDeletionAndAssignment(event, validField);
    }
    return next();
  }

  await handleS3FileDeletionAndAssignment(
    event,
    validField,
    req.fileLocation,
    req.body
  );

  next();
};

const checkDocumentUpload = async (req, res, next) => {
  const documentData = await Document.findOne({ _id: req.params.id });

  const validField = "fileUrl";

  if (!req.file) {
    if (documentData[validField] && req.body[validField] === "") {
      await handleS3FileDeletionAndAssignment(documentData, validField);
    }
    return next();
  }

  await handleS3FileDeletionAndAssignment(
    documentData,
    validField,
    req.fileLocation,
    req.body
  );

  next();
};

module.exports = {
  checkUserFileUpload,
  checkEventPhotoUpload,
  checkDocumentUpload,
};
