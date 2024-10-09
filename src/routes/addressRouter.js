"use strict";

const router = require("express").Router();

const addressController = require("../controllers/addressController");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isAdmin,
  checkEmailVerification,
  isActive,
  addressOwnerOrAdmin,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /addresses

router.use([isLogin, isActive, checkEmailVerification]);

router
  .route("/")
  .get(isAdmin, addressController.list)
  .post(addressController.create);
router
  .route("/:id")
  .all([idValidation, addressOwnerOrAdmin])
  .get(addressController.read)
  .put(addressController.update)
  .patch(addressController.update)
  .delete(addressController.delete);

/* ------------------------------------------------------- */
module.exports = router;
