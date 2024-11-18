"use strict";

const router = require("express").Router();
const { isAdmin } = require("../middlewares/permissions.js");
const {
  statistics,
  resetDatabaseRequest,
  resetDatabase,
} = require("../controllers/adminController.js");

/* ------------------------------------------------------- */

// URL: /administration
router.use(isAdmin);
router.route("/statistics").get(statistics);
router.route("/reset-database").get(resetDatabaseRequest).post(resetDatabase);

/* ------------------------------------------------------- */
module.exports = router;
