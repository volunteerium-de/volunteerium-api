"use strict";

const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const { CustomError } = require("../errors/customError");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Message']
      #swagger.summary = 'Get all messages'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[field1]=value1</b></li>
          <li>URL/?<b>sort[field1]=1&sort[createdAt]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of messages retrieved successfully',
        schema: {
          error: false,
          details: [{ _id: 'message-id', conversationId: 'conversation-id', senderId: 'user-id', content: 'message-content' }],
          data: [{ _id: 'message-id', conversationId: 'conversation-id', senderId: 'user-id', content: 'message-content' }]
        }
      }
    */
    const data = await res.getModelList(
      Message,
      {},
      {
        path: "senderId",
        select: "fullName organizationName",
        populate: { path: "userDetailsId", select: "avatar organizationLogo" },
      }
    );
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Message),
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Message']
      #swagger.summary = 'Get a message by ID'
      #swagger.description = 'Retrieve a specific message by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Message ID'
      }
      #swagger.responses[200] = {
        description: 'Message retrieved successfully',
        schema: {
          error: false,
          data: { _id: 'message-id', conversationId: 'conversation-id', senderId: 'user-id', content: 'message-content', readerIds: [{ _id: 'user-id' }] }
        }
      }
      #swagger.responses[404] = {
        description: 'Message not found',
        schema: {
          error: true,
          message: 'Message not found'
        }
      }
    */
    const message = await Message.findById(req.params.id).populate({
      path: "senderId",
      select: "fullName organizationName",
      populate: { path: "userDetailsId", select: "avatar organizationLogo" },
    });

    if (!message) {
      throw new CustomError("Message not found", 404);
    }

    res.status(200).send({ error: false, data: message });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Message']
      #swagger.summary = 'Create a new message'
      #swagger.description = 'Create a new message and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $conversationId: 'conversation-id',
          $senderId: 'user-id',
          $content: 'message-content'
        }
      }
      #swagger.responses[201] = {
        description: 'Message created successfully',
        schema: {
          error: false,
          message: "New Message successfully created!",
          data: { _id: 'message-id', conversationId: 'conversation-id', senderId: 'user-id', content: 'message-content' }
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
    const { conversationId, senderId, content } = req.body;

    const message = new Message({
      conversationId,
      senderId,
      content,
    });

    await message.save();

    // push new message to related conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messageIds: message._id },
    });

    res.status(201).send({
      error: false,
      message: "New Message successfully created!",
      data: message,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Message']
      #swagger.summary = 'Update an existing message'
      #swagger.description = 'Update the details of an existing message by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Message ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $content: 'updated-message-content',
          $readerIds: ['updated-user-id1', 'updated-user-id2']
        }
      }
      #swagger.responses[200] = {
        description: 'Message updated successfully',
        schema: {
          error: false,
          new: { _id: 'message-id', conversationId: 'conversation-id', senderId: 'user-id', content: 'updated-message-content', readerIds: ['updated-user-id1', 'updated-user-id2'] }
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
        description: 'Message not found',
        schema: {
          error: true,
          message: 'Message not found'
        }
      }
    */
    const { id } = req.params;
    const updates = req.body;

    const message = await Message.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!message) {
      throw new CustomError("Message not found", 404);
    }

    res.status(200).send({ error: false, new: message });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Message']
      #swagger.summary = 'Delete a message by ID'
      #swagger.description = 'Delete a specific message by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Message ID'
      }
      #swagger.responses[200] = {
        description: 'Message deleted successfully',
        schema: {
          error: false,
          message: 'Message deleted successfully'
        }
      }
      #swagger.responses[404] = {
        description: 'Message not found',
        schema: {
          error: true,
          message: 'Message not found'
        }
      }
    */
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      throw new CustomError("Message not found", 404);
    }

    // pull this message from related conversation
    await Conversation.findByIdAndUpdate(message.conversationId, {
      $pull: { messageIds: message._id },
    });

    res.status(204).send({
      error: false,
      message: "Message deleted successfully",
    });
  },
};
