"use strict";

const router = require("express").Router();

const messageController = require("../controllers/messageController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /messages

router
  .route("/")
  .get(messageController.list)
  .post(messageController.sendMessage);
router.route("/:id").all(idValidation).get(messageController.read);

/* ------------------------------------------------------- */
module.exports = router;
