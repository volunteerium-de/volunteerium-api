"use strict";

const { CustomError } = require("../errors/customError");
const Contact = require("../models/contactModel");
const { sendFeedbackEmail } = require("../utils/email/emailService");

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
      #swagger.description = 'Handles user contact&message submission by validating input and sending contact form via email.'
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
        message: 'Thank you. We will get back to you as soon as possible!'
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
      #swagger.responses[400] = {
        description: 'Validation error',
        schema: {
          error: true,
          message: 'Please fill the contact form!'
        }
      }
      */
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      throw new CustomError("Please fill the contact form!", 400);
    }

    const data = await Contact.create(req.body);

    // send message email
    await sendFeedbackEmail(name, email, subject, message);

    res.status(201).send({
      error: false,
      data,
      message: "Thank you. We will get back to you as soon as possible!",
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
