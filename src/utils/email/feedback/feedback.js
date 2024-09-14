"use strict";

const fs = require("fs");
const path = require("path");

const getFeedbackHtml = (name, email, subject, feedback) => {
  let html = fs.readFileSync(path.join(__dirname, "feedback.html"), "utf8");

  // Replace placeholders with actual data
  html = html.replace(/{{name}}/g, name);
  html = html.replace(/{{email}}/g, email);
  html = html.replace(/{{subject}}/g, subject);
  html = html.replace(/{{feedback}}/g, feedback);

  return html;
};

module.exports = {
  getFeedbackHtml,
};
