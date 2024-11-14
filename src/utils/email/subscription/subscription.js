const fs = require("fs");
const path = require("path");
const { CLIENT_URL } = require("../../../../setups");

const getSubscriptionSuccessEmailHtml = (subscriptionId, subscriptionEmail) => {
  let html = fs.readFileSync(path.join(__dirname, "subscription.html"), "utf8");
  html = html.replace("{{subscriptionId}}", subscriptionId);
  html = html.replace("{{subscriptionEmail}}", subscriptionEmail);
  html = html.replace("{{clientUrl}}", CLIENT_URL);
  return html;
};

module.exports = { getSubscriptionSuccessEmailHtml };
