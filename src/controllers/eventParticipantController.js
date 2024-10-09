"use strict";

const { CustomError } = require("../errors/customError");
const EventParticipant = require("../models/eventParticipantModel");
const Event = require("../models/eventModel");
const User = require("../models/userModel");

// Helper functions to check existance of requested data
async function findEvent(eventId) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError(`Event with ID ${eventId} not found.`, 404);
  }
  return event;
}

async function findUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError(`User with ID ${userId} not found.`, 404);
  }
  return user;
}

// ===============================

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Get all event participants'
      #swagger.description = `You can send query parameters for search[], filter[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>filter[eventId]=value1</b></li>
          <li>URL/?<b>filter[userId]=value2</b></li>
          <li>URL/?<b>sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=10</b></li>
        </ul>`
      #swagger.responses[200] = {
        description: 'List of event participants retrieved successfully',
        schema: {
          error: false,
          data: [{ _id: 'participant-id', userId: 'user-id', eventId: 'event-id', isPending: true, isApproved: false, hasJoined: false }]
        }
      }
    */
    const data = await res.getModelList(EventParticipant, {}, [
      {
        path: "userId",
        select: "fullName organizationName email",
        populate: { path: "userDetailsId", select: "avatar organizationLogo" },
      },
      {
        path: "eventId",
        select: "title eventPhoto",
      },
    ]);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(EventParticipant),
      data,
    });
  },

  requestJoin: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Request to join an event'
      #swagger.description = 'User sends a request to join an event'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $eventId: 'event-id'
        }
      }
      #swagger.responses[200] = {
        description: 'Join request sent successfully',
        schema: {
          error: false,
          message: "Join request sent successfully."
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'User has already joined this event.'
        }
      }
    */
    const { userId, eventId } = req.body;

    await findEvent(eventId);
    await findUser(userId);

    const newParticipant = await EventParticipant.requestJoin(userId, eventId);
    res.status(200).send({
      error: false,
      message: "Join request sent successfully.",
      data: newParticipant,
    });
  },

  approveParticipant: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Approve an event participant'
      #swagger.description = 'Approve a participant to join an event'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $eventId: 'event-id'
        }
      }
      #swagger.responses[200] = {
        description: 'Participant approved successfully',
        schema: {
          error: false,
          message: "Participant approved successfully."
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'The event has reached its maximum number of participants.'
        }
      }
    */
    const { userId, eventId } = req.body;

    await findEvent(eventId);
    await findUser(userId);

    const updatedParticipant = await EventParticipant.approveParticipant(
      userId,
      eventId
    );

    await Event.findByIdAndUpdate(eventId, {
      $push: { eventParticipantIds: updatedParticipant._id },
    });

    res.status(200).send({
      error: false,
      message: "Participant approved successfully.",
      new: updatedParticipant,
    });
  },

  rejectParticipant: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Reject an event participant'
      #swagger.description = 'Reject a participant from joining an event'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $eventId: 'event-id'
        }
      }
      #swagger.responses[200] = {
        description: 'Participant rejected successfully',
        schema: {
          error: false,
          message: "Participant rejected successfully."
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'User has not requested to join this event.'
        }
      }
    */
    const { userId, eventId } = req.body;

    const event = await findEvent(eventId);
    await findUser(userId);

    const updatedParticipant = await EventParticipant.rejectParticipant(
      userId,
      eventId
    );

    if (event.eventParticipantIds.includes(updatedParticipant._id)) {
      await Event.findByIdAndUpdate(eventId, {
        $pull: { eventParticipantIds: updatedParticipant._id },
      });
    }

    res.status(200).send({
      error: false,
      message: "Participant rejected successfully.",
      new: updatedParticipant,
    });
  },

  confirmAttendance: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Confirm attendance of a participant'
      #swagger.description = 'Confirm that a participant has joined an event'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $userId: 'user-id',
          $eventId: 'event-id'
        }
      }
      #swagger.responses[200] = {
        description: 'User attendance confirmed and points updated',
        schema: {
          error: false,
          message: "User attendance confirmed and points updated."
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'User is not approved to join this event.'
        }
      }
    */
    const { userId, eventId } = req.body;

    await findEvent(eventId);
    await findUser(userId);

    const updatedParticipant = await EventParticipant.confirmAttendance(
      userId,
      eventId
    );

    res.status(200).send({
      error: false,
      message: "User attendance confirmed and points updated.",
      new: updatedParticipant,
    });
  },

  delete: async (req, res) => {
    /*
      #swagger.tags = ['EventParticipant']
      #swagger.summary = 'Delete a participant by ID'
      #swagger.description = 'Delete a specific participant by their ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'EventParticipant ID'
      }
      #swagger.responses[204] = {
        description: 'Participant deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Participant not found',
        schema: {
          error: true,
          message: 'Participant not found!'
        }
      }
    */
    const participant = await EventParticipant.findById(req.params.id);

    if (participant) {
      const event = await findEvent(participant.eventId);

      if (event && event.eventParticipantIds.includes(participant._id)) {
        await Event.findByIdAndUpdate(participant.eventId, {
          $pull: { eventParticipantIds: participant._id },
        });
      }

      await EventParticipant.findByIdAndDelete(req.params.id);

      return res.status(204).send();
    }

    throw new CustomError("Participant not found!", 404);
  },
};
