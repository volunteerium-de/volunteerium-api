"use strict";

const { CustomError } = require("../errors/customError");
const EventFeedback = require("../models/eventFeedbackModel");
const Event = require("../models/eventModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['EventFeedback']
      #swagger.summary = 'Get all event feedbacks'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[feedback]=value1</b></li>
          <li>URL/?<b>filter[eventId]=value1</b></li>
          <li>URL/?<b>sort[rating]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of event feedbacks retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'feedback-id', userId: 'user-id', eventId: 'event-id', feedback: 'Great event!', rating: 5 }]
        }
      }
    */
    const data = await res.getModelList(EventFeedback, {}, [
      {
        path: "userId",
        select: "fullName organizationName email",
        populate: { path: "userDetailsId", select: "avatar organizationLogo" },
      },
      { path: "eventId", select: "title eventPhoto" },
    ]);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(EventFeedback),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['EventFeedback']
      #swagger.summary = 'Create a new event feedback'
      #swagger.description = 'Create a new event feedback and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $eventId: 'event-id',
          $feedback: 'Great event!',
          $rating: 5
        }
      }
      #swagger.responses[201] = {
        description: 'EventFeedback created successfully',
        schema: {
          error: false,
          message: "New feedback successfully created!",
          data: { _id: 'feedback-id', userId: 'user-id', eventId: 'event-id', feedback: 'Great event!', rating: 5 }
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

    if (req.user.userType == "individual") {
      req.body.userId = req.user._id;
    }

    const feedback = new EventFeedback(req.body);
    const data = await feedback.save();

    await Event.findByIdAndUpdate(req.body.eventId, {
      $push: { eventFeedbackIds: data._id },
    });

    res.status(201).send({
      error: false,
      message: "New feedback successfully created!",
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['EventFeedback']
      #swagger.summary = 'Get feedback by ID'
      #swagger.description = 'Retrieve a specific feedback by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'EventFeedback ID'
      }
      #swagger.responses[200] = {
        description: 'EventFeedback retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'feedback-id', userId: 'user-id', eventId: 'event-id', feedback: 'Great event!', rating: 5 }
        }
      }
      #swagger.responses[404] = {
        description: 'EventFeedback not found',
        schema: {
          error: true,
          message: 'EventFeedback not found'
        }
      }
    */
    const data = await EventFeedback.findOne({ _id: req.params.id }).populate([
      {
        path: "userId",
        select: "fullName organizationName email",
        populate: { path: "userDetailsId", select: "avatar organizationLogo" },
      },
      { path: "eventId", select: "title eventPhoto" },
    ]);
    res.status(data ? 200 : 404).send({
      error: !data,
      data,
      message: !data && "EventFeedback not found",
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['EventFeedback']
      #swagger.summary = 'Update an existing feedback'
      #swagger.description = 'Update the details of an existing feedback by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'EventFeedback ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $feedback: 'Updated feedback',
          $rating: 4
        }
      }
      #swagger.responses[202] = {
        description: 'EventFeedback updated successfully',
        schema: {
          error: false,
          message: 'EventFeedback updated successfully',
          data: { _id: 'feedback-id', userId: 'user-id', eventId: 'event-id', feedback: 'Updated feedback', rating: 4 }
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
        description: 'EventFeedback not found',
        schema: {
          error: true,
          message: 'EventFeedback not found'
        }
      }
    */

    const data = await EventFeedback.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(data ? 202 : 404).send({
      error: !data,
      message: data
        ? "EventFeedback updated successfully!"
        : "EventFeedback not found!",
      data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['EventFeedback']
      #swagger.summary = 'Delete a feedback by ID'
      #swagger.description = 'Delete a specific feedback by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'EventFeedback ID'
      }
      #swagger.responses[204] = {
        description: 'EventFeedback deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'EventFeedback not found',
        schema: {
          error: true,
          message: 'EventFeedback not found!'
        }
      }
    */
    const data = await EventFeedback.findByIdAndDelete({ _id: req.params.id });

    if (data) {
      await Event.findByIdAndUpdate(data.eventId, {
        $pull: { eventFeedbackIds: data._id },
      });

      return res.status(204).send();
    }

    res.status(404).send({
      error: true,
      message: "Event Feedback not found!",
    });
  },
};
