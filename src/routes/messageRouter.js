"use strict";

const router = require("express").Router();

const messageController = require("../controllers/messageController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /messages

router.route("/").get(messageController.list).post(messageController.create);

router
  .route("/:id")
  .all(idValidation)
  .get(messageController.read)
  .put(messageController.update)
  .patch(messageController.update)
  .delete(messageController.delete);

/* ------------------------------------------------------- */
module.exports = router;
