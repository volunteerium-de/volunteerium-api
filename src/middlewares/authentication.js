"use strict";

/* ---------------------------------- */
/*           VOLUNTEERIUM API         */
/*           Auth Middleware          */
/* ---------------------------------- */
// app.use(authentication)

const Token = require("../models/tokenModel");
const jwt = require("jsonwebtoken");
const { ACCESS_KEY } = require("../../setups");

module.exports = async (req, res, next) => {
  const auth = req.headers?.authorization || null; // Token ...tokenKey...
  const tokenKey = auth ? auth.split(" ") : null; // ['Token', '...tokenKey...']

  if (tokenKey) {
    if (tokenKey[0] == "Token") {
      // SimpleToken:

      const tokenData = await Token.findOne({ token: tokenKey[1] }).populate(
        "userId"
      );
      req.user = tokenData ? tokenData.userId : undefined;
    } else if (tokenKey[0] == "Bearer") {
      // JWT:

      jwt.verify(tokenKey[1], ACCESS_KEY, (error, data) => {
        req.user = data;
      });
    }
  }

  next();
};
