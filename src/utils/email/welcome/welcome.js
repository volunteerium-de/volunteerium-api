const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getWelcomeEmailHtml = (firstName, verifyToken, email) => {
  let html = fs.readFileSync(path.join(__dirname, "welcome.html"), "utf8");
  html = html.replace("{{firstName}}", firstName);
  html = html.replace(/{{verifyToken}}/g, verifyToken);
  html = html.replace(/{{email}}/g, email);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);
  return html;
};

module.exports = { getWelcomeEmailHtml };
