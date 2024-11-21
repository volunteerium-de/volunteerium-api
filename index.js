"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const http = require("http");
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
const { Server } = require("socket.io");

// Cron Job
const { reminderCronJob, job } = require("./src/helpers/cronJobs");
reminderCronJob.start();
job.start();

// Connect to DB:
const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

// - i18next
app.use(require("./src/configs/i18next"));

// CORS
const cors = require("cors");

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Authorization",
    "Accept-Language",
  ],
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

// Limit requests from same IP
const {
  generalRateLimiter,
  spesificRateLimiter,
} = require("./src/middlewares/rateLimiters");
app.use("/", generalRateLimiter);
app.use("/", spesificRateLimiter);

// - Logger
app.use(require("./src/middlewares/logger"));

// - Authentication
app.use(require("./src/middlewares/authentication"));

// - QueryHandler
app.use(require("./src/middlewares/queryHandler"));

// Routes;
app.use(`/api/${VERSION}`, require("./src/routes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

// Socket.IO
const socket = require("./socket");
const translations = require("./locales/translations");
socket(io);

app.get("/", (req, res) => {
  res.redirect(`/api/${VERSION}`);
});

app.all(`/api/${VERSION}`, (req, res) => {
  res.send({
    error: false,
    message: req.t(translations.welcome.message),
    docs: {
      swagger: `/api/${VERSION}/documentations/swagger`,
      redoc: `/api/${VERSION}/documentations/redoc`,
      json: `/api/${VERSION}/documentations/json`,
    },
    user: req.user,
  });
});

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: req.t(translations.notFound.route),
  });
});

// Error Handler Middleware
app.use(require("./src/middlewares/errorHandler"));

server.listen(PORT, () =>
  console.log(`server running on http://${HOST}:${PORT}`)
);
