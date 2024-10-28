"use strict";

const translations = require("../../locales/translations");
const { CustomError } = require("../errors/customError");
const EventReport = require("../models/eventReportModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['EventReport']
      #swagger.summary = 'Get all event reports'
      #swagger.description = `
        Retrieve a list of all event reports. You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[field1]=value1</b></li>
          <li>URL/?<b>sort[field1]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of event reports retrieved successfully',
        schema: {
          error: false,
          details: [{ Object }],
          data: [
            { 
              _id: 'report-id', 
              eventId: 'event-id', 
              reportedBy: 'user-id', 
              reportType: 'report-type', 
              content: 'report-content',
              createdAt: 'timestamp',
              updatedAt: 'timestamp'
            }
          ]
        }
      }
    */
    const data = await res.getModelList(EventReport);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(EventReport),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['EventReport']
      #swagger.summary = 'Create a new event report'
      #swagger.description = 'Create a new event report and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          eventId: 'event-id',
          reportedBy: 'user-id',
          reportType: 'report-type',
          content: 'report-content'
        }
      }
      #swagger.responses[201] = {
        description: 'Your report has been received. It will be reviewed carefully.',
        schema: {
          error: false,
          data: { 
            _id: 'report-id', 
            eventId: 'event-id', 
            reportedBy: 'user-id', 
            reportType: 'report-type', 
            content: 'report-content',
            createdAt: 'timestamp',
            updatedAt: 'timestamp' 
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Validation error',
        schema: {
          error: true,
          message: 'Validation error message'
        }
      }
    */
    const { eventId, reportType, content } = req.body;

    if (!eventId || !reportType || !content) {
      throw new CustomError(req.t(translations.eventReport.failed), 400);
    }

    const data = await EventReport.create(req.body);

    res.status(201).send({
      error: false,
      data,
      message: req.t(translations.eventReport.create),
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['EventReport']
      #swagger.summary = 'Get an event report by ID'
      #swagger.description = 'Retrieve a specific event report by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Event Report ID'
      }
      #swagger.responses[200] = {
        description: 'Event report retrieved successfully',
        schema: {
          error: false,
          data: { 
            _id: 'report-id', 
            eventId: 'event-id', 
            reportedBy: 'user-id', 
            reportType: 'report-type', 
            content: 'report-content',
            createdAt: 'timestamp',
            updatedAt: 'timestamp' 
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Event report not found',
        schema: {
          error: true,
          message: 'Event report not found'
        }
      }
    */
    const data = await EventReport.findOne({ _id: req.params.id });
    if (!data) {
      res.status(404).send({
        error: true,
        message: req.t(translations.eventReport.notFound),
      });
      return;
    }
    res.status(200).send({
      error: false,
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['EventReport']
      #swagger.summary = 'Delete an event report by ID'
      #swagger.description = 'Delete a specific event report by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Event Report ID'
      }
      #swagger.responses[204] = {
        description: 'Event report deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Event report not found',
        schema: {
          error: true,
          message: 'Event report not found'
        }
      }
    */
    const data = await EventReport.deleteOne({ _id: req.params.id });
    if (data.deletedCount === 0) {
      res.status(404).send({
        error: true,
        message: req.t(translations.eventReport.notFound),
      });
      return;
    }
    res.status(204).send();
  },
};
