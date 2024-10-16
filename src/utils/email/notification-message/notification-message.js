const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getNotificationAndMessageEmailHtml = (firstName, type, count) => {
  let html = fs.readFileSync(
    path.join(__dirname, "notification-message.html"),
    "utf8"
  );
  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{type}}/g, type);
  html = html.replace(/{{count}}/g, count);
  html = html.replace(/{{clientUrl}}/g, CLIENT_URL);

  return html;
};

module.exports = {
  getNotificationAndMessageEmailHtml,
};
