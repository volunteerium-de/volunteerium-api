"use strict";

const fs = require("fs");
const path = require("path");

const getAbsenceReportEmailHtml = (participantName, event) => {
  let html = fs.readFileSync(
    path.join(__dirname, "absenceReport.html"),
    "utf8"
  );

  const { title, startDate, endDate, addressId, eventPhoto } = event;

  const { streetName, streetNumber, zipCode, city, country } = addressId;
  const eventLocation = `${streetNumber} ${streetName}, ${zipCode} ${city}, ${country}`;

  html = html.replace("{{participantName}}", participantName);
  html = html.replace(/{{eventName}}/g, title);
  html = html.replace("{{startDate}}", startDate);
  html = html.replace("{{endDate}}", endDate);
  html = html.replace("{{eventLocation}}", eventLocation);
  html = html.replace("{{eventPhoto}}", eventPhoto);
  return html;
};

module.exports = { getAbsenceReportEmailHtml };
