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
  ADMIN_ID,
  ADMIN_EMAIL,
  RESET_DATABASE_KEY,
  RESET_DATABASE_EXP,
} = require("../../setups");

// Generate Simple Token
const generateSimpleToken = async (user) => {
  const token = passwordEncrypt(user._id + Date.now());
  const tokenData = await Token.create({
    userId: user._id,
    token: token,
  });

  const simpleToken = tokenData.token;
  return simpleToken;
};

// Generate Access Token
const generateAccessToken = (user) => {
  const accessInfo = {
    key: ACCESS_KEY,
    time: ACCESS_EXP || "1d",
    data: {
      _id: user._id,
      email: user.email,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      userDetailsId: user.userDetailsId,
    },
  };

  const { key, time, data } = accessInfo;

  const accessToken = jwt.sign(data, key, {
    expiresIn: time,
  });

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

  const { key, time, data } = refreshInfo;

  const refreshToken = jwt.sign(data, key, {
    expiresIn: time,
  });

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

  const { key, time, data } = verifyEmailInfo;

  const verifyEmailToken = jwt.sign(data, key, {
    expiresIn: time,
  });

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

  const { key, time, data } = resetPasswordInfo;

  // resetPasswordToken will be used for navigation in the frontend
  const resetPasswordToken = jwt.sign(data, key, {
    expiresIn: time,
  });

  return { resetCode, resetPasswordToken };
};

const generateResetDatabaseCode = () => {
  // resetCode will be sent to user via Email
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit random number

  const resetDatabaseInfo = {
    key: RESET_DATABASE_KEY,
    time: RESET_DATABASE_EXP,
    data: {
      userId: ADMIN_ID,
      email: ADMIN_EMAIL,
      code: resetCode,
    },
  };

  const { key, time, data } = resetDatabaseInfo;

  // resetDatabaseToken will be used for navigation in the frontend
  const resetDatabaseToken = jwt.sign(data, key, {
    expiresIn: time,
  });

  return { resetCode, resetDatabaseToken };
};

module.exports = {
  generateSimpleToken,
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  generateVerifyEmailToken,
  generateResetPasswordCode,
  generateResetDatabaseCode,
};
