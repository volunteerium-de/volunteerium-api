"use strict";

const router = require("express").Router();
const eventController = require("../controllers/eventController");
const idValidation = require("../middlewares/idValidation");

// URL: /events

router.route("/").get(eventController.list).post(eventController.create);
router
  .route("/:id")
  .all(idValidation)
  .get(eventController.read)
  .put(eventController.update)
  .patch(eventController.update)
  .delete(eventController.delete);

module.exports = router;
