"use strict";

const { getIoInstance } = require("../configs/socketInstance");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

const populateUserDetails = [
  {
    path: "userDetailsId",
    select: "avatar organizationLogo",
  },
];

const populateSender = {
  path: "senderId",
  select: "fullName organizationName",
  populate: populateUserDetails,
};

const populateParticipant = {
  path: "participantIds",
  select: "fullName organizationName",
  populate: populateUserDetails,
};

const populateMessage = {
  path: "messageIds",
  select: "senderId content readerIds createdAt",
  populate: populateSender,
};

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Conversation']
      #swagger.summary = 'Get all conversations'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[field1]=value1</b></li>
          <li>URL/?<b>sort[field1]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of conversations retrieved successfully',
        schema: {
          error: false,
          details: [{ Object }],
          data: [{ _id: 'conversation-id', ...}]
        }
      }
    */
    const data = await res.getModelList(
      Conversation,
      {
        $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
      },
      [
        {
          path: "eventId",
          select: "title description eventPhoto",
        },
        {
          path: "createdBy",
          select: "fullName organizationName",
          populate: populateUserDetails,
        },
        populateMessage,
        populateParticipant,
      ]
    );
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Conversation, {
        $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
      }),
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Conversation']
      #swagger.summary = 'Get a conversation by ID'
      #swagger.description = 'Retrieve a specific conversation by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Conversation ID'
      }
      #swagger.responses[200] = {
        description: 'Conversation retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'conversation-id',, participantIds: [{ _id: 'user-id', name: 'user-name' }], messageIds: [{ _id: 'message-id', text: 'message-text' }] }
        }
      }
      #swagger.responses[404] = {
        description: 'Conversation not found',
        schema: {
          error: true,
          message: 'Conversation not found'
        }
      }
    */
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user._id },
      },
      { $addToSet: { readerIds: req.user._id } }
    );

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate([
      {
        path: "eventId",
        select: "title description eventPhoto",
      },
      {
        path: "createdBy",
        select: "fullName organizationName",
        populate: populateUserDetails,
      },
      populateMessage,
      populateParticipant,
    ]);

    res.status(200).send({ error: false, data: conversation });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Conversation']
      #swagger.summary = 'Create a new conversation'
      #swagger.description = 'Create a new conversation and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $eventId: 'event-id',
          $createdBy: 'user-id',
          $participantIds: ['user-id1', 'user-id2']
        }
      }
      #swagger.responses[201] = {
        description: 'Conversation created successfully',
        schema: {
          error: false,
          message: "New Conversation successfully created!",
          data: { _id: 'conversation-id', eventId: 'event-id', createdBy: 'user-id', participantIds: ['user-id1', 'user-id2'] }
        }
      }
      #swagger.responses[400] = {
        description: 'Bad Request',
        schema: {
          error: true,
          message: 'Validation errors'
        }
      }
      #swagger.responses[403] = {
        description: 'Forbidden',
        schema: {
          error: true,
          message: 'Only organizations can create a conversation with multiple participants'
        }
      }
    */
    const { eventId, participantIds } = req.body;

    const conversation = new Conversation({
      eventId,
      createdBy: req.body.createdBy ? req.body.createdBy : req.user._id,
      participantIds,
    });
    await conversation.save();

    const io = getIoInstance();
    io.emit("receive_conversations", conversation);

    res.status(201).send({
      error: false,
      message: "New Conversation successfully created!",
      data: conversation,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Conversation']
      #swagger.summary = 'Update an existing conversation'
      #swagger.description = 'Update the details of an existing conversation by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Conversation ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $participantIds: ['updated-user-id1', 'updated-user-id2']
        }
      }
      #swagger.responses[200] = {
        description: 'Conversation updated successfully',
        schema: {
          error: false,
          new: { _id: 'conversation-id', participantIds: ['updated-user-id1', 'updated-user-id2'] }
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
        description: 'Conversation not found',
        schema: {
          error: true,
          message: 'Conversation not found'
        }
      }
    */
    const { id } = req.params;
    const updates = req.body;

    const conversation = await Conversation.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({ error: false, new: conversation });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Conversation']
      #swagger.summary = 'Delete a conversation by ID'
      #swagger.description = 'Delete a specific conversation by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Conversation ID'
      }
      #swagger.responses[200] = {
        description: 'Conversation and related messages deleted successfully',
        schema: {
          error: false,
          message: 'Conversation and related messages deleted successfully'
        }
      }
      #swagger.responses[404] = {
        description: 'Conversation not found',
        schema: {
          error: true,
          message: 'Conversation not found!'
        }
      }
    */
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);

    // Delete all messages related to this conversation
    await Message.deleteMany({ conversationId: id });

    const io = getIoInstance();
    io.emit("receive_conversations");

    res.status(204).send({
      error: false,
      message: "Conversation and related messages deleted successfully",
    });
  },
};
