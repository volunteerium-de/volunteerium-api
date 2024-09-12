"use strict";

/* ----------------------------------------------------------- */
// $ npm i morgan
/* ----------------------------------------------------------- */

// app.use(require('./src/middlewares/logger'));

const morgan = require("morgan");
const fs = require("node:fs");

const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

module.exports = morgan("combined", {
  stream: fs.createWriteStream(`./logs/${today}.log`, { flags: "a+" }),
});
