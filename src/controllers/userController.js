"use strict";

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { CustomError } = require("../errors/customError");
const { sendFeedbackEmail } = require("../utils/email/emailService");
const { AWS_S3_BASE } = require("../../setups");
const { deleteObjectByDateKeyNumber } = require("../helpers/deleteFromAwsS3");
const { extractDateNumber } = require("../utils/functions");
const { validateUserUpdatePayload } = require("../validators/userValidator");

module.exports = {
  // GET
  list: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "List Users"
      #swagger.description = `
        You can send query with endpoint for search[], sort[], page and limit.
        <ul> Examples:
            <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
            <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
            <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
    */

    let listFilter = {};

    // if (!req.user?.userType.toLowerCase() !== "admin") {
    //   listFilter._id = req.user._id;
    // }

    const data = await res.getModelList(User, listFilter, "userDetailsId");

    // const data = await res.getModelList(User, listFilter, [
    //   {
    //     path: "userDetailsId",
    //     populate: [
    //       {
    //         path: "interestIds",
    //         select: "name _id",
    //       },
    //       {
    //         path: "addressId",
    //         select: "-createdAt -updatedAt -__v",
    //       },
    //     ],
    //   },
    //   // { path: "documentIds", select: "-__v" },
    // ]);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User),
      data,
    });
  },
  // /:id => GET
  read: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Get Single User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }
    */

    const data = await User.findOne({ _id: req.params.id }).populate(
      "userDetailsId"
    );

    // const data = await User.findOne({ _id: req.params.id }).populate([
    //   {
    //     path: "userDetailsId",
    //     populate: [
    //       {
    //         path: "interestIds",
    //         select: "name _id",
    //       },
    //       {
    //         path: "addressId",
    //         select: "-createdAt -updatedAt -__v",
    //       },
    //     ],
    //   },
    //   // { path: "documentIds", select: "-__v" },
    // ]);
    res.status(200).send({
      error: false,
      data,
    });
  },
  // /:id => PUT / PATCH
  update: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Update User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }      
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              $ref: "#/definitions/User'
          }
      }
    */

    const validationError = await validateUserUpdatePayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
      });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new CustomError("Email already exists", 400);
      }
    }

    if (req.user.userType.toLowerCase() !== "admin") {
      delete req.body.isActive;
      delete req.body.isEmailVerified;
      delete req.body.userType;
      delete req.body.googleId;
    }

    const customFilter =
      req.user?.userType.toLowerCase() === "admin"
        ? { _id: req.params.id }
        : { _id: req.user?._id };

    // Fetch current user from database
    const user = await User.findOne(customFilter);

    // Check if password is being updated
    if (req.body.password) {
      const oldPassword = req.body.oldPassword;

      if (!oldPassword) {
        throw new CustomError(
          "Current Password is required to update password",
          400
        );
      } else {
        // Check if old password is correct
        const isCorrectPassword = bcrypt.compareSync(
          oldPassword,
          user.password
        );
        if (!isCorrectPassword) {
          throw new CustomError(
            "Please provide correct current password!",
            401
          );
        }
      }
      // Compare new password with current hashed password
      const isSamePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      // If new password is different, hash the new password
      if (!isSamePassword) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }
    }

    if (req.body.oldPassword) {
      delete req.body.oldPassword; // requires just for security and user notifications
    }

    const data = await User.findOneAndUpdate(customFilter, req.body, {
      runValidators: true,
    }).populate("userDetailsId"); // returns data

    // const data = await User.findOneAndUpdate(customFilter, req.body, {
    //   runValidators: true,
    // }).populate([
    //   {
    //     path: "userDetailsId",
    //     populate: [
    //       {
    //         path: "interestIds",
    //         select: "name _id",
    //       },
    //       {
    //         path: "addressId",
    //         select: "-createdAt -updatedAt -__v",
    //       },
    //     ],
    //   },
    //   // { path: "documentIds", select: "-__v" },
    // ]); // returns data

    let message;

    if (req.body.password) {
      message = "Password has been updated successfully.";
    } else if (req.body.email || req.body.fullName) {
      message = "Profile information has been updated successfully.";
    } else {
      message = "Changes have been saved successfully.";
    }

    res.status(202).send({
      error: false,
      message,
      new: await User.findOne(customFilter).populate("userDetailsId"),
      // new: await User.findOne(customFilter).populate([
      //   {
      //     path: "userDetailsId",
      //     populate: [
      //       {
      //         path: "interestIds",
      //         select: "name _id",
      //       },
      //       {
      //         path: "addressId",
      //         select: "-createdAt -updatedAt -__v",
      //       },
      //     ],
      //   },
      //   { path: "documentIds", select: "-__v" },
      // ]),
      data,
    });
  },
  // feedback => POST
  feedback: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Submit Feedback"
      #swagger.description = "Handles user feedback submission by validating input and sending feedback via email."
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Feedback submission data',
        required: true,
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            subject: {
              type: 'string',
              description: 'Subject of the feedback',
              example: 'Feedback Subject'
            },
            feedback: {
              type: 'string',
              description: 'Feedback message',
              example: 'This is a feedback message.'
            }
          },
          required: ['name', 'email', 'feedback']
        }
      }
    */
    const { name, email, subject, feedback } = req.body;

    if (!name || !email || !feedback) {
      throw new CustomError("Please fill the contact form!", 400);
    }

    // send feedback email
    await sendFeedbackEmail(name, email, subject, feedback);

    res.status(200).send({
      error: false,
      message: "Thank you. We will get back to you as soon as possible!",
    });
  },
  // /:id => DELETE
  delete: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Delete User"
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID',
        required: true,
        type: 'string'
      }      
    */

    const idFilter =
      req.user?.userType.toLowerCase() !== "admin"
        ? { _id: req.params.id }
        : { _id: req.user?._id };
    //console.log("idFilter":, idFilter);

    const userIdFilter =
      req.user?.userType.toLowerCase() !== "admin"
        ? { userId: req.params.id }
        : { userId: req.user?._id };

    // Find all documents related to this user
    const documents = await Documents.find(userIdFilter);

    // Delete each document from AWS S3
    for (const doc of documents) {
      if (doc.fileUrl) {
        const identifierForDocument = extractDateNumber(doc.fileUrl);
        await deleteObjectByDateKeyNumber(identifierForDocument);
      }
    }

    // Delete all events, documents and messages etc. related to this user
    await Events.deleteMany(userIdFilter);
    await Messages.deleteMany({
      senderId:
        req.user?.userType.toLowerCase() !== "admin"
          ? req.params.id
          : req.user?._id,
    });
    await Documents.deleteMany(userIdFilter);

    // Delete user
    const result = await User.findOneAndDelete(idFilter); // returns data

    if (result.avatar && result.avatar.includes(AWS_S3_BASE)) {
      const identifierForImage = extractDateNumber(result.avatar);
      await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from s3 bucket
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
