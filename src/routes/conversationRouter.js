"use strict";

const router = require("express").Router();

const conversationController = require("../controllers/conversationController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /conversations

router
  .route("/")
  .get(conversationController.list)
  .post(conversationController.create);

router
  .route("/:id")
  .all(idValidation)
  .get(conversationController.read)
  .put(conversationController.update)
  .patch(conversationController.update)
  .delete(conversationController.delete);

/* ------------------------------------------------------- */
module.exports = router;
