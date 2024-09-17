const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getForgotPasswordEmailHtml = (firstName, token, resetCode) => {
  let html = fs.readFileSync(path.join(__dirname, "forgot.html"), "utf8");
  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{token}}/g, token);
  html = html.replace(/{{resetCode}}/g, resetCode);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);
  return html;
};

module.exports = {
  getForgotPasswordEmailHtml,
};
