"use strict";

const { HOST, PORT } = require("./setups");

/* ------------------------------------------------------- */
const swaggerAutogen = require("swagger-autogen")();
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.name,
    description: packageJson.description,
    // termsOfService:
    //   "https://www.termsfeed.com/live/ed8b4e15-b05a-41d6-b12b-920a89756f29",
    contact: { name: packageJson.author, email: "info.volunteerium@gmail.com" },
    license: { name: packageJson.license },
  },
  host: `${HOST}:${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Token: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Simple Token Authentication * Example: <b>Token ...tokenKey...</b>",
    },
    Bearer: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "JWT Authentication * Example: <b>Bearer ...accessToken...</b>",
    },
  },
  security: [{ Token: [] }, { Bearer: [] }],
  definitions: {
    // Models:
    Address: require("./src/models/addressModel").schema.obj,
    Contact: require("./src/models/contactModel").schema.obj,
    Conversation: require("./src/models/conversationModel").schema.obj,
    Document: require("./src/models/documentModel").schema.obj,
    EventFeedback: require("./src/models/eventFeedbackModel").schema.obj,
    Event: require("./src/models/eventModel").schema.obj,
    EventParticipant: require("./src/models/eventParticipantModel").schema.obj,
    EventReport: require("./src/models/eventReportModel").schema.obj,
    Interest: require("./src/models/interestModel").schema.obj,
    Message: require("./src/models/messageModel").schema.obj,
    Notification: require("./src/models/notificationModel").schema.obj,
    Token: require("./src/models/tokenModel").schema.obj,
    UserDetails: require("./src/models/userDetailsModel").schema.obj,
    User: require("./src/models/userModel").schema.obj,
  },
};

const routes = ["./index.js"];
const outputFile = "./src/configs/swagger.json";

// Create JSON file:
swaggerAutogen(outputFile, routes, document);
