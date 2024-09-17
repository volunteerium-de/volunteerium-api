"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// token:
router.use("/tokens", require("./token"));

/* ------------------------------------------------------- */
module.exports = router;
