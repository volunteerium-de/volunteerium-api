"use strict";

const router = require("express").Router();

const contactController = require("../controllers/contactController");
const idValidation = require("../middlewares/idValidation");
const { isLogin, isAdmin } = require("../middlewares/permissions");
const { emailLimiter } = require("../middlewares/rateLimiters");

/* ------------------------------------------------------- */

// URL: /contacts

router
  .route("/")
  .get(isLogin, isAdmin, contactController.list)
  .post(emailLimiter, contactController.create);

router
  .route("/:id")
  .all(idValidation, isLogin, isAdmin)
  .get(contactController.read)
  .delete(contactController.delete);

/* ------------------------------------------------------- */
module.exports = router;
