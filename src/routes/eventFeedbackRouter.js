"use strict";

const router = require("express").Router();

const eventFeedbackController = require("../controllers/eventFeedbackController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /event-feedbacks

router
  .route("/")
  .get(eventFeedbackController.list)
  .post(eventFeedbackController.create);
router
  .route("/:id")
  .all(idValidation)
  .get(eventFeedbackController.read)
  .put(eventFeedbackController.update)
  .patch(eventFeedbackController.update)
  .delete(eventFeedbackController.delete);

/* ------------------------------------------------------- */
module.exports = router;
