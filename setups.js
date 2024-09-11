"use strict";
require("dotenv").config();
module.exports = {
  PORT: process.env?.PORT || 8000,
  HOST: process.env?.HOST || "127.0.0.1",
  BACKEND_URL: process.env?.BACKEND_URL,
  CLIENT_URL: process.env?.CLIENT_URL,
  MONGODB_URI: process.env?.MONGODB_URI,
  SECRET_KEY: process.env?.SECRET_KEY,
  PAGE_SIZE: process.env?.PAGE_SIZE || 25,
  ACCESS_KEY: process.env?.ACCESS_KEY,
  ACCESS_EXP: process.env?.ACCESS_EXP || "30m",
  REFRESH_KEY: process.env?.REFRESH_KEY,
  REFRESH_EXP: process.env?.REFRESH_EXP || "2d",
  NODE_ENV: process.env.NODE_ENV == "production" ? true : false, //! in development false - // Set secure to true if using HTTPS / after deployment
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_S3_BUCKET_REGION: process.env.AWS_S3_BUCKET_REGION,
  AWS_S3_BASE: process.env.AWS_S3_BASE,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_URL: process.env.AWS_URL,
  VERSION: process.env.VERSION,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
};