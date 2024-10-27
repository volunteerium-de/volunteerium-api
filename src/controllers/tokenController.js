"use strict";

const translations = require("../../locales/translations");
const Token = require("../models/tokenModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Token']
      #swagger.summary = 'Get all tokens'
      #swagger.description = 'Retrieve a list of all tokens'
      #swagger.responses[200] = {
        description: 'List of tokens retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'token-id', token: 'token-string', userId: 'user-id' }]
        }
      }
    */
    const data = await res.getModelList(Token);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Token),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Token']
      #swagger.summary = 'Create a new token'
      #swagger.description = 'Create a new token and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          token: 'token-string',
          userId: 'user-id'
        }
      }
      #swagger.responses[201] = {
        description: 'Token created successfully',
        schema: {
          error: false,
          data: { _id: 'token-id', token: 'token-string', userId: 'user-id' }
        }
      }
    */
    const data = await Token.create(req.body);
    res.status(201).send({
      error: false,
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Token']
      #swagger.summary = 'Get a token by ID'
      #swagger.description = 'Retrieve a specific token by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Token ID'
      }
      #swagger.responses[200] = {
        description: 'Token retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'token-id', token: 'token-string', userId: 'user-id' }
        }
      }
    */
    const data = await Token.findOne({ _id: req.params.id });
    res.status(200).send({
      error: false,
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Token']
      #swagger.summary = 'Delete a token by ID'
      #swagger.description = 'Delete a specific token by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Token ID'
      }
      #swagger.responses[204] = {
        description: 'Token deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Token not found',
        schema: {
          error: true,
          message: 'Token not found'
        }
      }
    */
    const data = await Token.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
      meesage: req.t(translations.token.notFound),
    });
  },
};
