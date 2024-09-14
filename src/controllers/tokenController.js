"use strict";

const Token = require("../models/tokenModel");

module.exports = {
  list: async (req, res) => {
    const data = await res.getModelList(Token);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Token),
      totalRecords: data.length,
      data,
    });
  },
  create: async (req, res) => {
    const data = await Token.create(req.body);
    res.status(201).send({
      error: false,
      data,
    });
  },
  read: async (req, res) => {
    const data = await Token.findOne({ _id: req.params.id });
    res.status(200).send({
      error: false,
      data,
    });
  },
  delete: async (req, res) => {
    const data = await Token.deleteOne({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
      meesage: "User not found",
    });
  },
};
