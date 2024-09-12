"use strict";

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { CustomError } = require("../errors/customError");
const {
  AWS_S3_BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} = require("../../setups");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure AWS S3
const s3Client = new S3Client({
  region: AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Accept a wide range of MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// Function to upload Google avatar to S3
const uploadAvatarToS3 = async (avatarUrl, profileId) => {
  try {
    const response = await fetch(avatarUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-avatar_${profileId}.jpg`;

    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    throw new Error("Failed to upload avatar to S3.");
  }
};

// Middleware function to upload single file to S3
const uploadSingleToS3 = (type) => async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new CustomError(
      "File type error. Allowed file types are JPEG, JPG, PNG, PDF, DOC, DOCX, and TXT.",
      400
    );
  }

  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `${Date.now()}-${type}_${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    // ACL: 'public-read' // Uncomment if you want the file to be publicly readable
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    req.fileLocation = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
    next();
  } catch (err) {
    throw new CustomError("Failed to upload single file.", 500);
  }
};

// Middleware function to upload multiple files to S3
const uploadArrayToS3 = (type) => async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const uploadPromises = req.files.map((file) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new CustomError(
          "File type error. Allowed file types are JPEG, JPG, PNG, PDF, DOC, DOCX, and TXT.",
          400
        );
      }

      const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}-${type}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read' // Uncomment if you want the file to be publicly readable
      };

      const command = new PutObjectCommand(params);

      // Return a promise that resolves to the file location
      return s3Client.send(command).then(() => ({
        location: `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`,
        key: params.Key,
      }));
    });

    // Wait for all upload promises to resolve
    const results = await Promise.all(uploadPromises);

    // Set the file locations on the request object
    req.filesLocations = results.map((result) => result.location);
    next();
  } catch (err) {
    throw new CustomError("Failed to upload files.", 500);
  }
};

module.exports = {
  upload,
  uploadAvatarToS3,
  uploadSingleToS3,
  uploadArrayToS3,
};
