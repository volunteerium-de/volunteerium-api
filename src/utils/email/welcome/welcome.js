const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getWelcomeEmailHtml = (firstName, token) => {
  let html = fs.readFileSync(path.join(__dirname, "welcomeEmail.html"), "utf8");
  html = html.replace("{{firstName}}", firstName);
  html = html.replace(/{{token}}/g, token);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);
  return html;
};

module.exports = { getWelcomeEmailHtml };
