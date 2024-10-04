"use strict";

const router = require("express").Router();

const notificationController = require("../controllers/notificationController");
const idValidation = require("../middlewares/idValidation");

/* ------------------------------------------------------- */

// URL: /notifications

router
  .route("/")
  .get(notificationController.list)
  .post(notificationController.create);

router.put("/read-all", notificationController.markAllAsRead);

router
  .route("/:id")
  .all(idValidation)
  .get(notificationController.read)
  .put(notificationController.update)
  .patch(notificationController.update)
  .delete(notificationController.delete);

/* ------------------------------------------------------- */
module.exports = router;
