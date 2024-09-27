"use strict";

const Interest = require("../models/interestModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Interest']
      #swagger.summary = 'Get all interests'
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
      message: "New interest successfully created!",
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
      message: !data && "Interest not found",
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
    res.status(data ? 202 : 404).send({
      error: !data,
      message: data ? "Interest updated successfully!" : "Interest not found!",
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
      #swagger.responses[204] = {
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
    const data = await Interest.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Interest successfully deleted!"
        : "Interest not found!",
    });
  },
};
