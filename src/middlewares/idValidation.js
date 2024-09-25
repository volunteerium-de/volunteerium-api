"use strict";

const { mongoose } = require("../configs/dbConnection");
const { CustomError } = require("../errors/customError");

module.exports = (req, res, next) => {
  const idIsValid = mongoose.Types.ObjectId.isValid(req.params.id); //* builtin method
  if (!idIsValid) throw new CustomError("Id is not valid!", 404);
  next();
};
