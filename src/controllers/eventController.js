"use strict";

const Event = require("../models/eventModel");
const Address = require("../models/addressModel");
const EventParticipant = require("../models/eventParticipantModel");
const EventFeedback = require("../models/eventFeedbackModel");
const Document = require("../models/documentModel");
const Notification = require("../models/notificationModel");
const {
  validateEventPayload,
  validateUpdateEventPayload,
} = require("../validators/eventValidator");
const { CustomError } = require("../errors/customError");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'List all events'
      #swagger.description = `
        Retrieve a list of events based on search and filter criteria. You can send query parameters to filter, sort, and paginate the results.
        <ul>
          <li>Search by title: <b>search[title]=charity</b></li>
          <li>Search by location: <b>search[location]=berlin</b></li>
          <li>Filter events by start date: <b>filter[startDate]=2024-10-10</b></li>
          <li>Filter events by end date: <b>filter[endDate]=2024-10-28</b></li>
          <li>Filter by categories: <b>filter[category]=health,animal,education</b></li>
          <li>Sort events by creation date: <b>sort[createdAt]=desc</b></li>
          <li>Pagination: <b>page=1</b> and <b>limit=5</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of events retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [
            {
              _id: 'event-id',
              title: 'Event Title',
              description: 'Event Description',
              createdBy: {
                _id: 'user-id',
                userType: "organization",
                email: "organization-email",
                fullName: "",
                organizationName: "Organization Name",
                userDetailsId: {
                  _id: 'userDetails-id',
                  avatar: '',
                  isFullNameDisplay: true,
                  organizationLogo: 'Organization Logo Url',
                },
              },
              addressId: {
                _id: 'address-id',
                city: 'City Name',
                country: 'Country Name',
                zipCode: "Zip Code"
                iframeSrc: "Iframe Source"
                latitude: "Latitude",
                longitude: "Longitude",
              },
              interestIds: [
                {
                  _id: 'interest-id',
                  name: 'Interest Name',
                },
              ],
              startDate: "2024-09-25T12:00:00.000Z",
              endDate: "2024-09-25T14:00:00.000Z",
              languages: ["de"],
              eventPhoto: 'photo-url',
              isRecurring: false,
              isOnline: false,
              isActive: true,
              maxParticipant: 100,
              createdAt: "2024-09-24T10:00:00.000Z",
              updatedAt: "2024-09-24T10:00:00.000Z",
            },
          ],
        }
      }
    */
    const data = await res.getModelList(Event, {}, [
      {
        path: "createdBy",
        select: "userType email fullName organizationName",
        populate: {
          path: "userDetailsId",
          select: "avatar isFullNameDisplay organizationLogo",
        },
      },
      {
        path: "addressId",
        select: "city country zipCode",
      },
      {
        path: "interestIds",
        select: "name",
      },
    ]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Event),
      data,
    });
  },
  listParticipatedEvents: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'List events participated by a user'
      #swagger.description = 'Retrieve a list of events that a specific user has participated in, based on user ID from the EventParticipant model.'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'User ID'
      }
      #swagger.responses[200] = {
        description: 'List of participated events retrieved successfully',
        schema: {
          error: false,
          data: [
            {
              _id: 'event-id',
              title: 'Event Title',
              description: 'Event Description',
              createdBy: {
                _id: 'user-id',
                userType: "organization",
                email: "organization-email",
                fullName: "",
                organizationName: "Organization Name",
                userDetailsId: {
                  _id: 'userDetails-id',
                  avatar: '',
                  isFullNameDisplay: true,
                  organizationLogo: 'Organization Logo Url',
                },
              },
              addressId: {
                _id: 'address-id',
                city: 'City Name',
                country: 'Country Name',
                zipCode: "Zip Code"
                iframeSrc: "Iframe Source"
                latitude: "Latitude",
                longitude: "Longitude",
              },
              interestIds: [
                {
                  _id: 'interest-id',
                  name: 'Interest Name',
                },
              ],
              startDate: "2024-09-25T12:00:00.000Z",
              endDate: "2024-09-25T14:00:00.000Z",
              languages: ["de"],
              eventPhoto: 'photo-url',
              isRecurring: false,
              isOnline: false,
              isActive: true,
              maxParticipant: 100,
              createdAt: "2024-09-24T10:00:00.000Z",
              updatedAt: "2024-09-24T10:00:00.000Z",
            },
          ],
        }
      }
    */

    const userId = req.params.id;

    const participantRecords = await EventParticipant.find({ userId });

    if (!participantRecords.length) {
      return res.status(404).send({
        error: true,
        message: "No participated events found for this user.",
      });
    }

    const participantIds = participantRecords.map(
      (participant) => participant._id
    );

    const data = await res.getModelList(
      Event,
      {
        eventParticipantIds: { $in: participantIds },
      },
      [
        {
          path: "createdBy",
          select: "userType email fullName organizationName",
          populate: {
            path: "userDetailsId",
            select: "avatar isFullNameDisplay organizationLogo",
          },
        },
        {
          path: "addressId",
          select: "city country zipCode",
        },
        {
          path: "interestIds",
          select: "name",
        },
      ]
    );

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Event, {
        eventParticipantIds: { $in: participantIds },
      }),
      data,
    });
  },
  listEventLanguages: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'List languages with event count'
      #swagger.description = 'Retrieve a list of languages and the count of events for each language'
      #swagger.responses[200] = {
        description: 'List of languages with event count retrieved successfully',
        schema: {
          error: false,
          data: [
            { _id: 1, langCode: "de", eventCount: 10 },
            { _id: 2, langCode: "en", eventCount: 5 },
            // more items...
          ],
        },
      }
    */

    const currentDate = new Date();

    // filter out past events based on the endDate before aggregating the language statistics
    const languageStats = await Event.aggregate([
      { $match: { endDate: { $gte: currentDate } } },
      { $unwind: "$languages" },
      {
        $group: {
          _id: "$languages",
          eventCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          langCode: "$_id",
          eventCount: 1,
        },
      },
      {
        $sort: { eventCount: -1 },
      },
    ]);

    // Count of events whose endDates are after the current date and time
    const totalEventCount = await Event.find({
      endDate: { $gte: currentDate },
    }).countDocuments();

    res.status(200).send({
      error: false,
      totalEventCount,
      data: languageStats,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'Create a new event'
      #swagger.description = 'Create a new event and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/Event" }
      }
      #swagger.responses[201] = {
        description: 'Event created successfully',
        schema: {
          error: false,
          data: { $ref: "#/definitions/Event" }
        }
      }
    */

    const validationError = await validateEventPayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    if (req.user.userType !== "admin") {
      delete req.body.isActive;
    }

    const {
      city,
      country,
      zipCode,
      streetName,
      streetNumber,
      state,
      additional,
    } = req.body;

    if (!req.body.isOnline) {
      if (!city || !country || !zipCode || !streetName || !streetNumber) {
        throw new Error(
          "Address informations are required for physical events."
        );
      }

      const address = new Address({
        city,
        country,
        zipCode,
        streetName,
        streetNumber,
        state,
        additional,
      });

      const savedAddress = await address.save();
      req.body.addressId = savedAddress._id;
    }

    if (req.fileLocation) {
      req.body.eventPhoto = req.fileLocation;
    }

    const event = new Event(req.body);
    const savedEvent = await event.save();

    res.status(201).send({
      error: false,
      message: "New Event successfully created!",
      data: savedEvent,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'Get an event by ID'
      #swagger.description = 'Retrieve a specific event by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Event ID'
      }
      #swagger.responses[200] = {
        description: 'Event retrieved successfully',
        schema: {
          error: false,
          data:{
              _id: 'event-id',
              title: 'Event Title',
              description: 'Event Description',
              createdBy: {
                _id: 'user-id',
                userType: "organization",
                email: "organization-email",
                fullName: "",
                organizationName: "Organization Name",
                userDetailsId: {
                  _id: 'userDetails-id',
                  avatar: '',
                  isFullNameDisplay: true,
                  organizationLogo: 'Organization Logo Url',
                  organizationDesc: 'Organization Description',
                  organizationUrl: 'https://organization.url',
                },
              },
              contactName: "Contact Name",
              contactEmail: "Contact Email",
              contactPhone: "Contact Phone",
              addressId: {
                _id: 'address-id',
                city: 'City Name',
                country: 'Country Name',
                zipCode: "ZipCode",
                streetName: "Street Name",
                streetNumber: "Street Number",
                additional: "Additional",
                iframeSrc: "Address IFrame",
                latitude: "Latitude",
                longitude: "Longitude",
              },
              interestIds: [
                {
                  _id: 'interest-id',
                  name: 'Interest Name',
                },
              ],
              languages: ["de"]
              eventPhoto: 'photo-url',
              isRecurring: false,
              isOnline: false,
              isActive: true,
              maxParticipant: 100,
              startDate: "2024-09-25T12:00:00.000Z",
              endDate: "2024-09-25T14:00:00.000Z",
              eventParticipantIds: [
                {
                  _id: 'user-id',
                  email: "individual-email",
                  fullName: "individual-name",
                  userDetailsId: {
                    _id: 'userDetails-id',
                    avatar: 'avatar-url',
                    isFullNameDisplay: true,
                  }
                }
              ],
              eventFeedbackIds: [
                {
                  feedback: "Feedback",
                  rating: 5,
                  userId: {
                    _id: 'user-id',
                    email: "individual-email",
                    fullName: "individual-name",
                    userDetailsId: {
                      _id: 'userDetails-id',
                      avatar: 'avatar-url',
                      isFullNameDisplay: true,
                    }
                  }
                }
              ],
              createdAt: "2024-09-24T10:00:00.000Z",
              updatedAt: "2024-09-25T10:00:00.000Z",
            },
        }
      }
    */
    const data = await Event.findById(req.params.id).populate([
      {
        path: "createdBy",
        select: "userType email fullName organizationName",
        populate: {
          path: "userDetailsId",
          select:
            "avatar isFullNameDisplay organizationLogo organizationDesc organizationUrl",
        },
      },
      {
        path: "addressId",
      },
      {
        path: "interestIds",
        select: "name",
      },
      {
        path: "eventParticipantIds",
        select: "email fullName",
        populate: {
          path: "userDetailsId",
          select: "avatar isFullNameDisplay",
        },
      },
      {
        path: "eventFeedbackIds",
        populate: {
          path: "userId",
          select: "email fullName",
          populate: {
            path: "userDetailsId",
            select: "avatar isFullNameDisplay",
          },
        },
      },
    ]);

    res.status(200).send({
      error: false,
      data,
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'Update an event by ID'
      #swagger.description = 'Update a specific event by its ID and save the changes to the database'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Event ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: { $ref: "#/definitions/Event" }
      }
      #swagger.responses[200] = {
        description: 'Event updated successfully',
        schema: {
          error: false,
          data: { $ref: "#/definitions/Event" }
        }
      }
    */

    const validationError = await validateUpdateEventPayload(req.body);

    if (validationError) {
      throw new CustomError(validationError, 400);
    }

    if (req.body.eventParticipantIds) {
      delete req.body.eventParticipantIds;
    }

    if (req.user.userType !== "admin") {
      delete req.body.isActive;
    }

    // If an address is provided, update it; otherwise, create a new address if needed
    const {
      city,
      country,
      zipCode,
      streetName,
      streetNumber,
      state,
      additional,
    } = req.body;

    // Get the existing event
    const event = await Event.findById(req.params.id);
    if (!event) {
      throw new Error("Event not found.", 404);
    }

    // Use the event's existing addressId
    const addressId = event.addressId;

    if (city || country || zipCode || streetName || streetNumber) {
      if (addressId) {
        // Update existing address if it exists
        await Address.findByIdAndUpdate(
          addressId,
          {
            city,
            country,
            zipCode,
            streetName,
            streetNumber,
            state,
            additional,
          },
          { new: true, runValidators: true }
        );
      } else if (!addressId && !req.body.isOnline) {
        // If no addressId and the event is not online, create a new address
        const address = new Address({
          city,
          country,
          zipCode,
          streetName,
          streetNumber,
          state,
          additional,
        });
        const savedAddress = await address.save();
        req.body.addressId = savedAddress._id;
      }
    } else if (addressId && req.body.isOnline) {
      // if the event is online and no address data provided, then we set addressId to null!
      req.body.addressId = null;
      await Address.deleteOne({ _id: addressId });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("addressId");

    console.log(updatedEvent);

    // Generate notifications for participants
    for (const participantId of updatedEvent.eventParticipantIds) {
      console.log(participantId);
      const participant = await EventParticipant.findById(participantId);

      if (!participant) {
        console.warn(`No participant found with ID: ${participantId}`);
        continue; // Skip to the next participant if not found
      }

      if (participant.userId) {
        await Notification.generate(
          participant.userId,
          "eventUpdate",
          updatedEvent.title
        );
      } else {
        console.warn(`No user found with ID: ${participant.userId}`);
      }
    }

    res.status(202).send({
      error: false,
      message: "Event successfully updated!",
      new: updatedEvent,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Event']
      #swagger.summary = 'Delete an event by ID'
      #swagger.description = 'Delete a specific event by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Event ID'
      }
      #swagger.responses[204] = {
        description: 'Event deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Event not found',
        schema: {
          error: true,
          message: 'Event not found'
        }
      }
    */

    // Check if event exists
    const event = await Event.findById(req.params.id).populate("documentIds");

    // Array to hold promises for deleting files
    const deletePromises = [];

    // Delete event photo from S3 if it exists
    if (event.eventPhoto) {
      const identifierForImage = extractDateNumber(event.eventPhoto);
      console.log(
        `Deleting existing Event photo from S3: ${identifierForImage}`
      );
      deletePromises.push(deleteObjectByDateKeyNumber(identifierForImage));
    }

    if (event.documentIds.length) {
      // Prepare document deletion
      for (const documentData of event.documentIds) {
        const identifierForImage = extractDateNumber(documentData.file);
        console.log(
          `Deleting existing Document related to this event from S3: ${identifierForImage}`
        );
        deletePromises.push(deleteObjectByDateKeyNumber(identifierForImage));
      }
    }

    // Execute all delete promises for S3
    await Promise.all(deletePromises);

    // Delete related datas from the database
    await Document.deleteMany({ eventId: req.params.id });

    // Generate notifications for participants
    for (const participantId of event.eventParticipantIds) {
      const participant = await EventParticipant.findById(participantId);
      await Notification.generate(
        participant.userId,
        "eventCancellation",
        event.title
      );
    }
    await EventParticipant.deleteMany({ eventId: req.params.id });
    await EventFeedback.deleteMany({ eventId: req.params.id });
    await Address.deleteOne({ _id: event.addressId });

    // Delete the event
    const data = await Event.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Event and related files successfully deleted!"
        : "Event not found",
    });
  },
};
