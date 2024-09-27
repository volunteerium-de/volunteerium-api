"use strict";

const router = require("express").Router();

const interest = require("../controllers/interestController");
const idValidation = require("../middlewares/idValidation");
// const { isAdmin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /interests

router.route("/").get(interest.list).post(interest.create);
router
  .route("/:id")
  .all(idValidation)
  .get(interest.read)
  .put(interest.update)
  .patch(interest.update)
  .delete(interest.delete);

/* ------------------------------------------------------- */
module.exports = router;
