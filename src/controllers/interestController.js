"use strict";

const translations = require("../../locales/translations");
const Interest = require("../models/interestModel");
const Event = require("../models/eventModel");
const UserDetails = require("../models/userDetailsModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Get all interests without pagination'
      #swagger.responses[200] = {
        description: 'List of interests retrieved successfully',
        schema: {
          error: false,
          data: [{ _id: 'interest-id', name: 'interest-name' }]
        }
      }
    */
    const data = await Interest.find();
    res.status(200).send({
      error: false,
      data,
    });
  },
  listPagination: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Get all interests with pagination'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[name]=value1</b></li>
          <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of interests retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'interest-id', name: 'interest-name' }]
        }
      }
    */
    const data = await res.getModelList(Interest);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Interest),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Create a new interest'
      #swagger.description = 'Create a new interest and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $name: 'interest-name',
        }
      }
      #swagger.responses[201] = {
        description: 'Interest created successfully',
        schema: {
          error: false,
          message: "New interest successfully created!",
          data: { _id: 'interest-id', name: 'interest-name' }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Validation errors'
        }
      }
    */

    const data = await Interest.create(req.body);
    res.status(201).send({
      error: false,
      message: req.t(translations.interest.create),
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Get an interest by ID'
      #swagger.description = 'Retrieve a specific interest by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Interest ID'
      }
      #swagger.responses[200] = {
        description: 'Interest retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'interest-id', name: 'interest-name' }
        }
      }
      #swagger.responses[404] = {
        description: 'Interest not found',
        schema: {
          error: true,
          message: 'Interest not found'
        }
      }
    */
    const data = await Interest.findOne({ _id: req.params.id });
    res.status(data ? 200 : 404).send({
      error: !data,
      data,
      message: !data && req.t(translations.interest.notFound),
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Update an existing interest'
      #swagger.description = 'Update the details of an existing interest by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Interest ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $name: 'updated-interest-name',
        }
      }
      #swagger.responses[202] = {
        description: 'Interest updated successfully',
        schema: {
          error: false,
          message: 'Interest updated successfully',
          data: { _id: 'interest-id', name: 'updated-interest-name' }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Validation errors'
        }
      }
      #swagger.responses[404] = {
        description: 'Interest not found',
        schema: {
          error: true,
          message: 'Interest not found'
        }
      }
    */

    const data = await Interest.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!data) {
      throw new CustomError(req.t(translations.interest.notFound), 404);
    }

    res.status(202).send({
      error: false,
      message: req.t(translations.interest.update),
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Delete an interest by ID'
      #swagger.description = 'Delete a specific interest by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Interest ID'
      }
      #swagger.responses[200] = {
        description: 'Interest deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Interest not found',
        schema: {
          error: true,
          message: 'Interest not found!'
        }
      }
    */
    const interestId = req.params.id;

    const data = await Interest.deleteOne({ _id: interestId });

    if (!data.deletedCount) {
      return res.status(404).send({
        error: true,
        message: req.t(translations.interest.notFound),
      });
    }

    await Promise.all([
      Event.updateMany(
        { interestIds: interestId },
        { $pull: { interestIds: interestId } }
      ),
      UserDetails.updateMany(
        { interestIds: interestId },
        { $pull: { interestIds: interestId } }
      ),
    ]);

    res.status(200).send({
      error: false,
      message: req.t(translations.interest.delete),
    });
  },
};
