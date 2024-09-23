"use strict";

const redirectWithError = (res, url, statusCode, message) => {
  res.redirect(
    `${url}?payload=${encodeURIComponent(
      JSON.stringify({ statusCode, message })
    )}`
  );
};

module.exports = { redirectWithError };
