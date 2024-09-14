"use strict";

class CustomError extends Error {
  name = "CustomError";
  constructor(msg, statusCode = 500) {
    super(msg);
    this.statusCode = statusCode;
  }
}

module.exports = { CustomError };
