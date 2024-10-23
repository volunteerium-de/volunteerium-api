"use strict";

const fs = require("fs");
const path = require("path");

const getReminderEmailHtml = (participantName, event) => {
  let html = fs.readFileSync(
    path.join(__dirname, "eventReminder.html"),
    "utf8"
  );

  const {
    title,
    description,
    startDate,
    endDate,
    addressId,
    eventPhoto,
  } = event;

  const { streetName, streetNumber, zipCode, city, country } = addressId;
  const eventLocation = `${streetNumber} ${streetName}, ${zipCode} ${city}, ${country}`;

  html = html.replace("{{participantName}}", participantName);
  html = html.replace(/{{eventName}}/g, title);
  html = html.replace("{{eventDescription}}", description);
  html = html.replace("{{startDate}}", startDate);
  html = html.replace("{{endDate}}", endDate);
  html = html.replace("{{eventLocation}}", eventLocation);
  html = html.replace("{{eventPhoto}}", eventPhoto);
  return html;
};

module.exports = { getReminderEmailHtml };
