"use strict";

const jwt = require("jsonwebtoken");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const Token = require("../models/tokenModel");
const {
  ACCESS_EXP,
  ACCESS_KEY,
  REFRESH_EXP,
  REFRESH_KEY,
  VERIFY_EMAIL_KEY,
  VERIFY_EMAIL_EXP,
  RESET_PASSWORD_KEY,
  RESET_PASSWORD_EXP,
} = require("../../setups");

// Generate Simple Token
const generateSimpleToken = async (user) => {
  const token = passwordEncrypt(user._id + Date.now());
  const tokenData = await Token.create({
    userId: user._id,
    token: token,
  });

  const simpleToken = tokenData.token;
  console.log("Simple Token generated: ", simpleToken);
  return simpleToken;
};

// Generate Access Token
const generateAccessToken = (user) => {
  const accessInfo = {
    key: ACCESS_KEY,
    time: ACCESS_EXP || "1d",
    data: {
      _id: user._id,
      userType: user.userType,
      email: user.email,
    },
  };

  const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
    expiresIn: accessInfo.time,
  });

  console.log("AccessToken generated: ", accessToken);
  return accessToken;
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  const refreshInfo = {
    key: REFRESH_KEY,
    time: REFRESH_EXP || "2d",
    data: {
      _id: user._id,
    },
  };

  const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
    expiresIn: refreshInfo.time,
  });

  console.log("RefreshToken generated: ", refreshToken);
  return refreshToken;
};

// Generate Auth Tokens
const generateAuthTokens = async (user) => {
  const simpleToken = await generateSimpleToken(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { simpleToken, accessToken, refreshToken };
};

// Generate Verify Email Token
const generateVerifyEmailToken = (user) => {
  const verifyEmailInfo = {
    key: VERIFY_EMAIL_KEY,
    time: VERIFY_EMAIL_EXP,
    data: {
      userId: user._id,
      email: user.email,
    },
  };

  const verifyEmailToken = jwt.sign(verifyEmailInfo.data, verifyEmailInfo.key, {
    expiresIn: verifyEmailInfo.time,
  });

  console.log("VerifyEmailToken generated: ", verifyEmailToken);
  return verifyEmailToken;
};

// Generate Reset Password Code
const generateResetPasswordCode = (user) => {
  // resetCode will be sent to user via Email
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit random number

  const resetPasswordInfo = {
    key: RESET_PASSWORD_KEY,
    time: RESET_PASSWORD_EXP,
    data: {
      userId: user._id,
      email: user.email,
      code: resetCode,
    },
  };

  // resetPasswordToken will be used for navigation in the frontend
  const resetPasswordToken = jwt.sign(
    resetPasswordInfo.data,
    resetPasswordInfo.key,
    {
      expiresIn: resetPasswordInfo.time,
    }
  );

  console.log("ResetPasswordCode generated: ", resetCode);
  return { resetCode, resetPasswordToken };
};

module.exports = {
  generateSimpleToken,
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  generateVerifyEmailToken,
  generateResetPasswordCode,
};
