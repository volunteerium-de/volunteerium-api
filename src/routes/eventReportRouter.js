"use strict";

const router = require("express").Router();

const eventReportController = require("../controllers/eventReportController");
const idValidation = require("../middlewares/idValidation");
const { isAdmin, isLogin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /event-reports

router
  .route("/")
  .get(isLogin, isAdmin, eventReportController.list)
  .post(eventReportController.create);

router
  .route("/:id")
  .all(idValidation, isLogin, isAdmin)
  .get(eventReportController.read)
  .delete(eventReportController.delete);

/* ------------------------------------------------------- */
module.exports = router;
