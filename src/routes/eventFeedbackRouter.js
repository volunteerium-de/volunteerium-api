"use strict";

const router = require("express").Router();

const eventFeedbackController = require("../controllers/eventFeedbackController");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isActive,
  checkEmailVerification,
  isFeedbackOwnerOrAdmin,
  canGiveFeedback,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /event-feedbacks

router.use([isLogin, isActive, checkEmailVerification]);

router
  .route("/")
  .get(eventFeedbackController.list)
  .post(canGiveFeedback, eventFeedbackController.create);
router
  .route("/:id")
  .all(idValidation, isFeedbackOwnerOrAdmin)
  .get(eventFeedbackController.read)
  .put(eventFeedbackController.update)
  .patch(eventFeedbackController.update)
  .delete(eventFeedbackController.delete);

/* ------------------------------------------------------- */
module.exports = router;
