"use strict";

const router = require("express").Router();
const userController = require("../controllers/userController");
const idValidation = require("../middlewares/idValidation");
const {
  isLogin,
  isActive,
  checkEmailVerification,
  isUserOwnerOrAdmin,
} = require("../middlewares/permissions");

// URL: /users

router
  .route("/")
  .get(isLogin, isActive, checkEmailVerification, userController.list);

router.post("/feedback", userController.feedback);
router
  .route("/:id")
  .all(idValidation)
  .get(userController.read)
  .put(
    isLogin,
    isActive,
    checkEmailVerification,
    isUserOwnerOrAdmin,
    userController.update
  )
  .patch(
    isLogin,
    isActive,
    checkEmailVerification,
    isUserOwnerOrAdmin,
    userController.update
  )
  .delete(
    isLogin,
    isActive,
    checkEmailVerification,
    isUserOwnerOrAdmin,
    userController.delete
  );

module.exports = router;
