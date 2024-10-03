"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const {
  CLIENT_URL,
  PORT,
  HOST,
  VERSION,
  NODE_ENV,
  SECRET_KEY,
  MONGODB_URI,
} = require("./setups");

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
require("./src/configs/passportjs-auth/passportConfig");
app.use(cookieParser());
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: NODE_ENV,
    },
  })
);

// Integrate PassportJS
app.use(passport.initialize()); // integration between passportjs and express app
app.use(passport.session()); // session data controller

// Accept JSON
app.use(express.json());

// Accept FormData
app.use(express.urlencoded({ extended: true }));

// Middlewares

// - Logger
app.use(require("./src/middlewares/logger"));

// - Authentication
app.use(require("./src/middlewares/authentication"));

// - QueryHandler
app.use(require("./src/middlewares/queryHandler"));

// Routes;
app.use(`/api/${VERSION}`, require("./src/routes"));

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
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`Server running on http://${HOST}:${PORT}`));
