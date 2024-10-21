"use strict";

const router = require("express").Router();

const conversationController = require("../controllers/conversationController");
const idValidation = require("../middlewares/idValidation");
const {
  isConversationOwnerOrAdmin,
  isConversationParticipant,
  isLogin,
  isActive,
  checkEmailVerification,
  canConversationParticipant,
  canConversationOwner,
} = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /conversations

router.use([isLogin, isActive, checkEmailVerification]);

router.route("/").get(conversationController.list).post(
  // canConversationOwner,
  // canConversationParticipant,
  conversationController.create
);

router
  .route("/:id")
  .all(idValidation, isConversationParticipant)
  .get(conversationController.read)
  .put(
    isConversationOwnerOrAdmin,
    canConversationParticipant,
    conversationController.update
  )
  .patch(
    isConversationOwnerOrAdmin,
    canConversationParticipant,
    conversationController.update
  )
  .delete(isConversationOwnerOrAdmin, conversationController.delete);

/* ------------------------------------------------------- */
module.exports = router;
