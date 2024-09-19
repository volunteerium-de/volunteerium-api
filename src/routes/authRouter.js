"use strict";

const router = require("express").Router();
const {
  register,
  login,
  logout,
  forgot,
  verifyReset,
  reset,
  refresh,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/refresh", refresh);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgot);
router.post("/verify-reset", verifyReset);
router.post("/reset/:resetToken", reset);

module.exports = router;
