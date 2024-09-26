"use strict";

const Event = require("../models/eventModel");
const Address = require("../models/addressModel");
const {
  validateEventPayload,
  validateUpdateEventPayload,
} = require("../validators/eventValidator");
const { CustomError } = require("../errors/customError");
const { mongoose } = require("../configs/dbConnection");

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
              },
              interestIds: [
                {
                  _id: 'interest-id',
                  name: 'Interest Name',
                },
              ],
              startDate: "2024-09-25T12:00:00.000Z",
              endDate: "2024-09-25T14:00:00.000Z",
              languages: ["de"]
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
      // {
      //   path: "interestIds",
      //   select: "name",
      // },
    ]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Event),
      data,
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
          "City, country, zip code, street name, and street number are required for offline events."
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
                iframe: "Address IFrame"
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
      // {
      //   path: "interestIds",
      //   select: "name",
      // },
      // {
      //   path: "eventParticipantIds",
      //   select: "email fullName",
      //   populate: {
      //     path: "userDetailsId",
      //     select: "avatar isFullNameDisplay",
      //   },
      // },
      // {
      //   path: "eventFeedbackIds",
      //   populate: {
      //     path: "userId",
      //     select: "email fullName",
      //     populate: {
      //       path: "userDetailsId",
      //       select: "avatar isFullNameDisplay",
      //     },
      //   },
      // },
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

    if (req.user.userType !== "admin") {
      delete req.body.isActive;
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).send({
      error: false,
      message: "Event successfully updated!",
      new: event,
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
    const data = await Event.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Event successfully deleted!"
        : "Event not found",
    });
  },
};
