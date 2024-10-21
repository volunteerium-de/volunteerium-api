"use strict";

const router = require("express").Router();

const contactController = require("../controllers/contactController");
const idValidation = require("../middlewares/idValidation");
const { isLogin, isAdmin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /contacts

router
  .route("/")
  .get(isLogin, isAdmin, contactController.list)
  .post(contactController.create);

router
  .route("/:id")
  .all(idValidation, isLogin, isAdmin)
  .get(contactController.read)
  .delete(contactController.delete);

/* ------------------------------------------------------- */
module.exports = router;
