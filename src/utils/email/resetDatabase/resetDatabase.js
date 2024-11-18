const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getResetDatabaseEmailHtml = (resetCode) => {
  let html = fs.readFileSync(
    path.join(__dirname, "resetDatabase.html"),
    "utf8"
  );
  html = html.replace(/{{resetCode}}/g, resetCode);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);
  return html;
};

module.exports = {
  getResetDatabaseEmailHtml,
};
