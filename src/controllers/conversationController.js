"use strict";

const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

module.exports = {
  list: async (req, res) => {
    const userId = req.params.id;

    const customFilter = {
      $or: [{ createdBy: userId }, { participantIds: userId }],
    };

    const data = await res.getModelList(Conversation, customFilter);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Conversation, customFilter),
      data,
    });
  },
  read: async (req, res) => {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participantIds", "name")
      .populate("messageIds");

    res.status(200).send({ error: false, data: conversation });
  },
  create: async (req, res) => {
    const { eventId, createdBy, description, participantIds } = req.body;

    const relatedEvent = await Event.findOne({ _id: eventId });

    const relatedCreater = await User.findOne({ _id: createdBy });

    if (req.body.participantIds.length > 1) {
      if (relatedCreater.userType === "organization") {
        req.body.photo = relatedEvent.eventPhoto;
        req.body.title = relatedEvent.title;
      } else if (relatedCreater.userType === "individual") {
        throw new CustomError(
          "Only organizations can create a conversation with multiple participants",
          403
        );
      }
    } else {
      delete req.body.photo;
      delete req.body.title;
    }

    const conversation = new Conversation({
      eventId,
      createdBy,
      title: req.body.title || "",
      description,
      participantIds,
      photo: req.body.photo || "",
    });
    await conversation.save();

    res.status(201).send({
      error: false,
      message: "New Conversation successfully created!",
      data: conversation,
    });
  },
  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const conversation = await Conversation.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).send({ error: false, new: conversation });
  },
  delete: async (req, res) => {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);

    // Delete all messages related to this conversation
    await Message.deleteMany({ conversationId: id });

    res.status(200).send({
      error: false,
      message: "Conversation and related messages deleted successfully",
    });
  },
};
