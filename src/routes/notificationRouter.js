"use strict";

const router = require("express").Router();

const notificationController = require("../controllers/notificationController");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isActive,
  checkEmailVerification,
  isAdmin,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /notifications

router.use([isLogin, isActive, checkEmailVerification]);

router
  .route("/")
  .get(notificationController.list)
  .post(isAdmin, notificationController.create);

router.get("/read-all", notificationController.markAllAsRead);

router
  .route("/:id")
  .all(idValidation, isAdmin)
  .get(notificationController.read)
  .put(notificationController.update)
  .patch(notificationController.update)
  .delete(notificationController.delete);

/* ------------------------------------------------------- */
module.exports = router;
