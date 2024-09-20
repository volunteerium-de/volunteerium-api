"use strict";

const router = require("express").Router();
const userDetailsController = require("../controllers/userDetailsController");
const idValidation = require("../middlewares/idValidation");

// URL: /details/users

router.route("/").get(userDetailsController.list);
router
  .route("/:id")
  // .all(idValidation)
  .get(userDetailsController.read)
  .put(userDetailsController.update)
  .patch(userDetailsController.update);

module.exports = router;
