const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getWelcomeEmailHtml = (firstName, verifyData) => {
  let html = fs.readFileSync(path.join(__dirname, "welcome.html"), "utf8");
  html = html.replace("{{firstName}}", firstName);
  html = html.replace(/{{verifyData}}/g, verifyData);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);
  return html;
};

module.exports = { getWelcomeEmailHtml };
