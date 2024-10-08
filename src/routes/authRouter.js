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
  authSuccess,
} = require("../controllers/authController");
const passport = require("passport");
const { CLIENT_URL } = require("../../setups");
const { checkAdminUserType } = require("../middlewares/permissions");

// URL: /auth

router.post("/register", checkAdminUserType, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/refresh", refresh);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgot);
router.post("/verify-reset", verifyReset);
router.post("/reset/:resetToken", reset);

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: `${CLIENT_URL}/auth/failure?provider=google`,
  }),
  authSuccess
);

module.exports = router;
