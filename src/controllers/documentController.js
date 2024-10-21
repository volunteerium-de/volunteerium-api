"use strict";

const Document = require("../models/documentModel");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const { deleteObjectByDateKeyNumber } = require("../helpers/deleteFromAwsS3");
const { extractDateNumber } = require("../utils/functions");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Document']
      #swagger.summary = 'Get all documents'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[title]=value1</b></li>
          <li>URL/?<b>sort[title]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of documents retrieved successfully',
        schema: {
          error: false,
          data: [{ _id: 'document-id', title: 'document-title', file: 'document-url' }]
        }
      }
    */
    const data = await res.getModelList(Document);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Document),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Document']
      #swagger.summary = 'Create a new document'
      #swagger.description = 'Create a new document and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $title: 'document-title',
          $file: 'document-url',
          $userId: 'user-id',
          $eventId: 'event-id'
        }
      }
      #swagger.responses[201] = {
        description: 'Document created successfully',
        schema: {
          error: false,
          message: "New document successfully created!",
          data: { _id: 'document-id', title: 'document-title', file: 'document-url' }
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

    if (req.fileLocation) {
      req.body.fileUrl = req.fileLocation;
    }

    const data = await Document.create(req.body);

    if (req.body.userId && req.body.eventId) {
      const event = await Event.findById(req.body.eventId);
      if (!event) {
        throw new CustomError("Event not found", 404);
      }
      event.documentIds.push(data._id);
      await event.save();
    } else if (req.body.userId && !req.body.eventId) {
      const user = await User.findById(req.body.userId);

      if (!user) {
        throw new CustomError("User not found", 404);
      }
      user.documentIds.push(data._id);
      await user.save();
    }

    res.status(201).send({
      error: false,
      message: "New document successfully created!",
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Document']
      #swagger.summary = 'Get a document by ID'
      #swagger.description = 'Retrieve a specific document by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Document ID'
      }
      #swagger.responses[200] = {
        description: 'Document retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'document-id', title: 'document-title', file: 'document-url' }
        }
      }
      #swagger.responses[404] = {
        description: 'Document not found',
        schema: {
          error: true,
          message: 'Document not found'
        }
      }
    */
    const data = await Document.findOne({ _id: req.params.id });
    res.status(data ? 200 : 404).send({
      error: !data,
      data,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Document']
      #swagger.summary = 'Update an existing document'
      #swagger.description = 'Update the details of an existing document by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Document ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $title: 'updated-document-title',
          $file: 'updated-document-url',
        }
      }
      #swagger.responses[202] = {
        description: 'Document updated successfully',
        schema: {
          error: false,
          message: 'Document updated successfully',
          data: { _id: 'document-id', title: 'updated-document-title', file: 'updated-document-url' }
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
        description: 'Document not found',
        schema: {
          error: true,
          message: 'Document not found'
        }
      }
    */

    // Ensure we do not allow userId and eventId updates
    if (req.body.userId) {
      delete req.body.userId;
    }

    if (req.body.eventId) {
      delete req.body.eventId;
    }

    const data = await Document.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(data ? 202 : 404).send({
      error: !data,
      message: data ? "Document updated successfully!" : "Document not found!",
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Document']
      #swagger.summary = 'Delete a document by ID'
      #swagger.description = 'Delete a specific document by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Document ID'
      }
      #swagger.responses[204] = {
        description: 'Document deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Document not found',
        schema: {
          error: true,
          message: 'Document not found!'
        }
      }
      */

    const documentData = await Document.findById(req.params.id);

    // User releated document will be also deleted in User
    if (documentData.userId && !documentData.eventId) {
      await User.updateOne(
        { _id: documentData.userId },
        { $pull: { documentIds: documentData._id } }
      );
    }

    // Event related document will be also deleted in Event
    if (documentData.userId && documentData.eventId) {
      await Event.updateOne(
        { _id: documentData.eventId },
        { $pull: { documentIds: documentData._id } }
      );
    }

    // Delete document from AWS-S3 Bucket
    const identifierForImage = extractDateNumber(documentData.fileUrl);
    console.log(`Deleting existing Document related to this document from S3`);
    await deleteObjectByDateKeyNumber(identifierForImage);

    const data = await Document.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Document successfully deleted!"
        : "Document not found!",
    });
  },
};
