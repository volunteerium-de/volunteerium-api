"use strict";

const User = require("../models/userModel");
const UserDetails = require("../models/userDetailsModel");
const Documents = require("../models/documentModel");
const Events = require("../models/eventModel");
const Messages = require("../models/messageModel");
const Conversations = require("../models/conversationModel");
const bcrypt = require("bcryptjs");
const { CustomError } = require("../errors/customError");
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
      #swagger.responses[200] = {
        description: 'List of users retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'user-id', email: 'user-email', fullName: 'User Name', userType: 'user', ...other }]
        }
      }
    */

    let listFilter = {};

    // if (!req.user?.userType.toLowerCase() !== "admin") {
    //   listFilter._id = req.user._id;
    // }

    const data = await res.getModelList(User, listFilter, [
      {
        path: "userDetailsId",
        populate: [
          {
            path: "interestIds",
            select: "name _id",
          },
          {
            path: "addressId",
            select: "-createdAt -updatedAt -__v",
          },
        ],
      },
      { path: "documentIds", select: "-__v" },
    ]);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User, listFilter),
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
      #swagger.responses[200] = {
        description: 'User retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'user-id', email: 'user-email', fullName: 'User Name', userType: 'user', ...other }
        }
      }
    */

    const data = await User.findOne({ _id: req.params.id }).populate([
      {
        path: "userDetailsId",
        populate: [
          {
            path: "interestIds",
            select: "name _id",
          },
          {
            path: "addressId",
            select: "-createdAt -updatedAt -__v",
          },
        ],
      },
      { path: "documentIds", select: "-__v" },
    ]);
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
              $ref: "#/definitions/User"
          }
      }
      #swagger.responses[202] = {
        description: 'User updated successfully',
        schema: {
          error: false,
          message: 'Profile information has been updated successfully.',
          new: { _id: 'user-id', email: 'user-email', fullName: 'User Name', userType: 'user', ...other },
          data: { _id: 'user-id', email: 'user-email', fullName: 'User Name', userType: 'user' }
        }
      }
      #swagger.responses[400] = {
        description: 'Validation error or email already exists',
        schema: {
          error: true,
          message: 'Validation error message'
        }
      }
      #swagger.responses[401] = {
        description: 'Incorrect current password',
        schema: {
          error: true,
          message: 'Please provide correct current password!'
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

    // Handle fullName or organizationName update
    if (req.body.fullName) {
      if (user.userType === "organization") {
        req.body.organizationName = req.body.fullName;
        delete req.body.fullName; // delete fullName for organizations
      } else {
        req.body.fullName = req.body.fullName;
        delete req.body.organizationName; // delete organizationName for individuals
      }
    }

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
    }).populate([
      {
        path: "userDetailsId",
        populate: [
          {
            path: "interestIds",
            select: "name _id",
          },
          {
            path: "addressId",
            select: "-createdAt -updatedAt -__v",
          },
        ],
      },
      { path: "documentIds", select: "-__v" },
    ]); // returns data

    let message = "Changes have been saved successfully.";

    // if (req.body.password) {
    //   message = "Password has been updated successfully.";
    // } else if (req.body.email || req.body.fullName) {
    //   message = "Profile information has been updated successfully.";
    // } else {
    //   message = "Changes have been saved successfully.";
    // }

    res.status(202).send({
      error: false,
      message,
      new: await User.findOne(customFilter).populate([
        {
          path: "userDetailsId",
          populate: [
            {
              path: "interestIds",
              select: "name _id",
            },
            {
              path: "addressId",
              select: "-createdAt -updatedAt -__v",
            },
          ],
        },
        { path: "documentIds", select: "-__v" },
      ]),
      data,
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
      #swagger.responses[204] = {
        description: 'User deleted successfully',
        schema: {
          error: false,
          message: 'Account successfully deleted!'
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Error message'
        }
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
    await Conversations.deleteMany({
      createdBy:
        req.user?.userType.toLowerCase() !== "admin"
          ? req.params.id
          : req.user?._id,
    });
    await Messages.deleteMany({
      senderId:
        req.user?.userType.toLowerCase() !== "admin"
          ? req.params.id
          : req.user?._id,
    });
    await Documents.deleteMany(userIdFilter);

    // Delete user
    await User.findOneAndDelete(idFilter);
    const result = await UserDetails.findOneAndDelete(userIdFilter);

    if (result.avatar) {
      const identifierForImage = extractDateNumber(result.avatar);
      await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from s3 bucket
    } else if (result.organizationLogo) {
      const identifierForLogo = extractDateNumber(result.organizationLogo);
      await deleteObjectByDateKeyNumber(identifierForLogo); // delete existing organization logo from s3 bucket
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
