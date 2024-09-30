"use strict";

const router = require("express").Router();

const addressController = require("../controllers/addressController");
const idValidation = require("../middlewares/idValidation");
// const iframeHandler = require("../middlewares/iframeHandler");

/* ------------------------------------------------------- */

// URL: /addresses

router.route("/").get(addressController.list).post(addressController.create);
router
  .route("/:id")
  .all(idValidation)
  .get(addressController.read)
  .put(addressController.update)
  .patch(addressController.update)
  .delete(addressController.delete);

/* ------------------------------------------------------- */
module.exports = router;
