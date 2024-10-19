"use strict";

const Contact = require("../models/contactModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Contact']
      #swagger.summary = 'Get all contacts'
      #swagger.description = `
        Retrieve a list of all contacts.You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[field1]=value1</b></li>
          <li>URL/?<b>sort[field1]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of contacts retrieved successfully',
        schema: {
          error: false,
          details: [{ Object }],
          data: [
            { 
              _id: 'contact-id', 
              name: 'contact-name', 
              email: 'contact-email',
              subject: 'contact-subject', 
              message: 'contact-message',
              createdAt: 'timestamp',
              updatedAt: 'timestamp'
            }
          ]
        }
      }
    */
    const data = await res.getModelList(Contact);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Contact),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Contact']
      #swagger.summary = 'Create a new contact'
      #swagger.description = 'Create a new contact and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'contact-name',
          email: 'contact-email',
          subject: 'contact-subject',
          message: 'contact-message'
        }
      }
      #swagger.responses[201] = {
        description: 'Contact created successfully',
        schema: {
          error: false,
          data: { 
            _id: 'contact-id', 
            name: 'contact-name', 
            email: 'contact-email',
            subject: 'contact-subject', 
            message: 'contact-message',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }
        }
      }
    */
    const data = await Contact.create(req.body);
    res.status(201).send({
      error: false,
      data,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Contact']
      #swagger.summary = 'Update a contact by ID'
      #swagger.description = 'Update a specific contact by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Contact ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'contact-name',
          email: 'contact-email',
          subject: 'contact-subject',
          message: 'contact-message'
        }
      }
      #swagger.responses[200] = {
        description: 'Contact updated successfully',
        schema: {
          error: false,
          data: { 
            _id: 'contact-id', 
            name: 'contact-name', 
            email: 'contact-email',
            subject: 'contact-subject', 
            message: 'contact-message',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Contact not found',
        schema: {
          error: true,
          message: 'Contact not found'
        }
      }
    */
    const data = await Contact.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).send({
      error: false,
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Contact']
      #swagger.summary = 'Get a contact by ID'
      #swagger.description = 'Retrieve a specific contact by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Contact ID'
      }
      #swagger.responses[200] = {
        description: 'Contact retrieved successfully',
        schema: {
          error: false,
          data: { 
            _id: 'contact-id', 
            name: 'contact-name', 
            email: 'contact-email',
            subject: 'contact-subject', 
            message: 'contact-message',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Contact not found',
        schema: {
          error: true,
          message: 'Contact not found'
        }
      }
    */
    const data = await Contact.findOne({ _id: req.params.id });

    res.status(200).send({
      error: false,
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Contact']
      #swagger.summary = 'Delete a contact by ID'
      #swagger.description = 'Delete a specific contact by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Contact ID'
      }
      #swagger.responses[204] = {
        description: 'Contact deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Contact not found',
        schema: {
          error: true,
          message: 'Contact not found'
        }
      }
    */
    const data = await Contact.deleteOne({ _id: req.params.id });
    if (data.deletedCount === 0) {
      res.status(404).send({
        error: true,
        message: "Contact not found",
      });
      return;
    }
    res.status(204).send();
  },
};
