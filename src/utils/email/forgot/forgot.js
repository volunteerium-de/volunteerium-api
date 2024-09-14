const fs = require("fs");
const path = require("path");

const getForgotPasswordEmailHtml = (firstName, token) => {
  let html = fs.readFileSync(
    path.join(__dirname, "forgotPassword.html"),
    "utf8"
  );
  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{token}}/g, token);
  html = html.replace(/{{clientUrl}}/g, process.env.CLIENT_URL);
  return html;
};

module.exports = {
  getForgotPasswordEmailHtml,
};
