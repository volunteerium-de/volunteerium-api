"use strict";

const translations = require("../../locales/translations");
const Subscription = require("../models/subscriptionModel");
const { sendEmail } = require("../utils/email/emailService");
const {
  getSubscriptionSuccessEmailHtml,
} = require("../utils/email/subscription/subscription");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ['Subscription']
      #swagger.summary = 'Get all subscriptions'
      #swagger.description = 'Retrieve a list of all subscriptions'
      #swagger.responses[200] = {
        description: 'List of subscriptions retrieved successfully',
        schema: {
          error: false,
          details: { type: 'array', items: { type: 'object' } },
          data: [{ _id: 'subscription-id', email: 'subscription-email' }]
        }
      }
    */

    const data = await res.getModelList(Subscription);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Subscription),
      data,
    });
  },
  subscribe: async (req, res) => {
    /*
      #swagger.tags = ['Subscription']
      #swagger.summary = 'Create a new subscription'
      #swagger.description = 'Create a new subscription and save it to the database'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          email: 'subscription-email',
        }
      }
      #swagger.responses[201] = {
        description: 'Subscription created successfully',
        schema: {
          error: false,
          message: 'Successfully subscribed to our newsletter. Stay tuned for updates!',
          data: { _id: 'subscription-id', email: 'subscription-email' }
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid email or email already exists',
        schema: {
          error: true,
          message: 'Failed to subscribe. Please try again later.'
        }
      }
    */
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send({
        error: true,
        message: req.t(translations.yup.email),
      });
    }

    try {
      const existingSubscription = await Subscription.findOne({ email });
      if (existingSubscription) {
        return res.status(400).send({
          error: true,
          message: req.t(translations.subscription.emailExists),
        });
      }

      const data = await Subscription.create(req.body);

      // Send email to user
      const emailSubject = "Thank you for subscribing!";
      const emailHtml = getSubscriptionSuccessEmailHtml(data._id, data.email);
      await sendEmail(data.email, emailSubject, emailHtml);

      res.status(201).send({
        error: false,
        message: req.t(translations.subscription.success),
        data,
      });
    } catch (error) {
      res.status(500).send({
        error: true,
        message: req.t(translations.subscription.fail),
      });
    }
  },
  unsubscribe: async (req, res) => {
    /*
      #swagger.tags = ['Subscription']
      #swagger.summary = 'Unsubscribe from a subscription by ID'
      #swagger.description = 'Unsubscribe a user by their subscription ID.'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Subscription ID'
      }
      #swagger.responses[202] = {
        description: 'Successfully unsubscribed',
        schema: {
          error: false,
          message: 'Successfully unsubscribed from our newsletter. We\'re sorry to see you go!'
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid subscription ID',
        schema: {
          error: true,
          message: 'Failed to unsubscribe. Please try again later.'
        }
      }
      #swagger.responses[404] = {
        description: 'Subscription not found',
        schema: {
          error: true,
          message: 'Subscription not found'
        }
      }
    */
    const { id } = req.params;

    try {
      const subscription = await Subscription.findByIdAndDelete(id);
      if (!subscription) {
        return res.status(404).send({
          error: true,
          message: req.t(translations.unsubscription.emailNotExists),
        });
      }

      res.status(202).send({
        error: false,
        message: req.t(translations.unsubscription.success),
      });
    } catch (error) {
      res.status(500).send({
        error: true,
        message: req.t(translations.unsubscription.failed),
      });
    }
  },
};
