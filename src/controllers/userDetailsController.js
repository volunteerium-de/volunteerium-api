"use strict";

const User = require("../models/userModel");
const UserDetails = require("../models/userDetailsModel");
const { CustomError } = require("../errors/customError");
const { AWS_S3_BASE } = require("../../setups");
const { deleteObjectByDateKeyNumber } = require("../helpers/deleteFromAwsS3");
const { extractDateNumber } = require("../utils/functions");
const {
  validateUserDetailsUpdatePayload,
} = require("../validators/userValidator");

module.exports = {
  // GET
  list: async (req, res) => {
    /*
        #swagger.tags = ["Details"]
        #swagger.summary = "List Users' Details"
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

    const data = await res.getModelList(UserDetails, listFilter);
    // const data = await res.getModelList(UserDetails, listFilter, [
    //   {
    //     path: "interestIds",
    //     select: "name _id",
    //   },
    //   {
    //     path: "addressId",
    //     select: "-createdAt -updatedAt -__v",
    //   },
    // ]);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(UserDetails),
      data,
    });
  },
  // /:id => GET
  read: async (req, res) => {
    /*
        #swagger.tags = ["Details"]
        #swagger.summary = "Get Single User's Details"
        #swagger.parameters['id'] = {
          in: 'path',
          description: 'User ID',
          required: true,
          type: 'string'
        }
      */

    const data = await UserDetails.findOne({ _id: req.params.id });

    // const data = await UserDetails.findOne({ _id: req.params.id }).populate([
    //   {
    //     path: "interestIds",
    //     select: "name _id",
    //   },
    //   {
    //     path: "addressId",
    //     select: "-createdAt -updatedAt -__v",
    //   },
    // ]);
    res.status(200).send({
      error: false,
      data,
    });
  },
  // /:id => PUT / PATCH
  update: async (req, res) => {
    /*
      #swagger.tags = ["Details"]
      #swagger.summary = "Update Single User's Details"
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
              $ref: "#/definitions/UserDetails'
          }
      }
    */

    const validationError = await validateUserDetailsUpdatePayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    const userDetails = await UserDetails.findOne({ _id: req.params.id });

    if (!userDetails) {
      throw new CustomError("User details not found", 404);
    }

    // console.log("req.user._id", req.user._id);

    const userId =
      req.user?.userType === "admin" ? req.body.userId : req.user._id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    req.body.userId = userId;
    // console.log("userId", req.body.userId);

    const data = await UserDetails.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        runValidators: true,
        new: true,
      }
    ); // returns data (user's details)

    // const data = await UserDetails.findOneAndUpdate(
    //   { _id: req.params.id },
    //   req.body,
    //   {
    //     runValidators: true,
    //     new: true,
    //   }
    // ).populate([
    //   {
    //     path: "interestIds",
    //     select: "name _id",
    //   },
    //   {
    //     path: "addressId",
    //     select: "-createdAt -updatedAt -__v",
    //   },
    // ]); // returns data (user's details)

    res.status(202).send({
      error: false,
      message: "Changes have been saved successfully.",
      new: await User.findOne({ _id: user._id }).populate("userDetailsId"),
      // new: await User.findOne({ _id: user._id }).populate([
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
};
