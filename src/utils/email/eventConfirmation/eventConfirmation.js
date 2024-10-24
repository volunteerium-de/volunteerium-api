"use strict";

const fs = require("fs");
const path = require("path");

const getEventConfirmationEmailHtml = (event) => {
  let html = fs.readFileSync(
    path.join(__dirname, "eventConfirmation.html"),
    "utf8"
  );

  const {
    createdBy,
    title,
    description,
    startDate,
    endDate,
    addressId,
    eventPhoto,
  } = event;

  const organizerName = createdBy.fullName
    ? createdBy.fullName.split(" ")[0]
    : createdBy.organizerName;
  const { streetName, streetNumber, zipCode, city, country } = addressId;
  const eventLocation = `${streetNumber} ${streetName}, ${zipCode} ${city}, ${country}`;

  html = html.replace("{{organizer}}", organizerName);
  html = html.replace(/{{eventName}}/g, title);
  html = html.replace("{{eventDescription}}", description);
  html = html.replace("{{startDate}}", startDate);
  html = html.replace("{{endDate}}", endDate);
  html = html.replace("{{eventLocation}}", eventLocation);
  html = html.replace("{{eventPhoto}}", eventPhoto);
  return html;
};

module.exports = { getEventConfirmationEmailHtml };
