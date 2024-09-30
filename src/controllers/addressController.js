"use strict";

const Address = require("../models/addressModel");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Address']
      #swagger.summary = 'Get all addresses'
      #swagger.description = `
        You can send query parameters for search[], sort[], page, and limit.
        <ul>
          <li>URL/?<b>search[city]=value1</b></li>
          <li>URL/?<b>sort[city]=1&sort[country]=-1</b></li>
          <li>URL/?<b>page=2&limit=1</b></li>
        </ul>
      `
      #swagger.responses[200] = {
        description: 'List of addresses retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [
            {
              _id: 'address-id',
              city: 'Berlin',
              country: 'Germany',
              zipCode: '10115',
              state: 'Berlin',
              streetName: 'Berliner Straße',
              streetNumber: '45',
              additional: 'None',
              iframeSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=13.3878%2C52.5323%2C13.3878%2C52.5323&layer=mapnik'
            }
          ]
        }
      }
    */
    const data = await res.getModelList(Address);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Address),
      data,
    });
  },
  create: async (req, res) => {
    /*
      #swagger.tags = ['Address']
      #swagger.summary = 'Create a new address'
      #swagger.description = 'Create a new address and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          city: 'Berlin',
          country: 'Germany',
          zipCode: '10115',
          state: 'Berlin',
          streetName: 'Berliner Straße',
          streetNumber: '45',
          additional: 'None',
          iframeSrc: 'Iframe Src'
        }
      }
      #swagger.responses[201] = {
        description: 'Address created successfully',
        schema: {
          error: false,
          message: "New address successfully created!",
          data: {
            _id: 'address-id',
            city: 'Berlin',
            country: 'Germany',
            zipCode: '10115',
            state: 'Berlin',
            streetName: 'Berliner Straße',
            streetNumber: '45',
            additional: 'None',
            iframeSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=13.3882%2C52.5316%2C13.3898%2C52.5323&layer=mapnik'
          }
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

    const data = await Address.create(req.body);
    res.status(201).send({
      error: false,
      message: "New address successfully created!",
      data,
    });
  },
  read: async (req, res) => {
    /*
      #swagger.tags = ['Address']
      #swagger.summary = 'Get an address by ID'
      #swagger.description = 'Retrieve a specific address by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Address ID'
      }
      #swagger.responses[200] = {
        description: 'Address retrieved successfully',
        schema: {
          error: false,
          data: {
            _id: 'address-id',
            city: 'Berlin',
            country: 'Germany',
            zipCode: '10115',
            state: 'Berlin',
            streetName: 'Berliner Straße',
            streetNumber: '45',
            additional: 'None',
            iframeSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=13.3882%2C52.5316%2C13.3898%2C52.5323&layer=mapnik'
          }
        }
      }
      #swagger.responses[404] = {
        description: 'Address not found',
        schema: {
          error: true,
          message: 'Address not found'
        }
      }
    */
    const data = await Address.findOne({ _id: req.params.id });
    res.status(data ? 200 : 404).send({
      error: !data,
      data,
      message: !data && "Address not found",
    });
  },
  update: async (req, res) => {
    /*
      #swagger.tags = ['Address']
      #swagger.summary = 'Update an existing address'
      #swagger.description = 'Update the details of an existing address by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Address ID'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          city: 'Berlin',
          country: 'Germany',
          zipCode: '10115',
          state: 'Berlin',
          streetName: 'Berliner Straße',
          streetNumber: '45',
          additional: 'None',
          iframeSrc: 'Iframe Src'
        }
      }
      #swagger.responses[202] = {
        description: 'Address updated successfully',
        schema: {
          error: false,
          message: 'Address updated successfully',
          data: {
            _id: 'address-id',
            city: 'Berlin',
            country: 'Germany',
            zipCode: '10115',
            state: 'Berlin',
            streetName: 'Berliner Straße',
            streetNumber: '45',
            additional: 'None',
            iframeSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=13.3882%2C52.5316%2C13.3898%2C52.5323&layer=mapnik'
          }
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
        description: 'Address not found',
        schema: {
          error: true,
          message: 'Address not found'
        }
      }
    */

    const data = await Address.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(data ? 202 : 404).send({
      error: !data,
      message: data ? "Address updated successfully!" : "Address not found!",
      new: data,
    });
  },
  delete: async (req, res) => {
    /*
      #swagger.tags = ['Address']
      #swagger.summary = 'Delete an address by ID'
      #swagger.description = 'Delete a specific address by its ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Address ID'
      }
      #swagger.responses[204] = {
        description: 'Address deleted successfully'
      }
      #swagger.responses[404] = {
        description: 'Address not found',
        schema: {
          error: true,
          message: 'Address not found!'
        }
      }
    */
    const data = await Address.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Address successfully deleted!"
        : "Address not found!",
    });
  },
};
