"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const { CLIENT_URL, PORT, HOST, VERSION, NODE_ENV } = require("./setups");

// Cron Job

// Connect to DB:
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

// CORS
const cors = require("cors");

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  // allowedHeaders: ["Origin", "Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// PassportJS Auth Config

// Accept JSON
app.use(express.json());

// Accept FormData
app.use(express.urlencoded({ extended: true }));

// Middlewares

// - Logger
app.use(require("./src/middlewares/logger"));

// - Authentication

// - QueryHandler

// Routes
// app.use(`/api/${VERSION}`, require("./src/routes"));

app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Welcome to Volunteerium API",
    // docs: {
    //   swagger: "/documents/swagger",
    //   redoc: "/documents/redoc",
    //   json: "/documents/json",
    // },
    // user: req.user,
  });
});

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: "Route not found",
  });
});

// Error Handler Middleware

app.listen(PORT, () => console.log(`server running on http://${HOST}:${PORT}`));
