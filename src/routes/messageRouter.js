"use strict";

const router = require("express").Router();

const messageController = require("../controllers/messageController");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isActive,
  checkEmailVerification,
  isMessageOwnerOrAdmin,
  canSendMessage,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /messages

router.use([isLogin, isActive, checkEmailVerification]);

router.route("/").get(messageController.list).post(messageController.create);
// .post(canSendMessage, messageController.create);

router
  .route("/:id")
  .all(idValidation, isMessageOwnerOrAdmin)
  .get(messageController.read)
  .put(messageController.update)
  .patch(messageController.update)
  .delete(messageController.delete);

/* ------------------------------------------------------- */
module.exports = router;
