"use strict";

const router = require("express").Router();

const interestController = require("../controllers/interestController");
const idValidation = require("../middlewares/idValidation");
const { isAdmin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /interests

router.route("/").get(interestController.list).post(interestController.create);
router.use(isAdmin);
router
  .route("/:id")
  .all(idValidation)
  .get(interestController.read)
  .put(interestController.update)
  .patch(interestController.update)
  .delete(interestController.delete);

/* ------------------------------------------------------- */
module.exports = router;
