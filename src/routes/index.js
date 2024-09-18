"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// token:
router.use("/tokens", require("./token"));
// auth:
app.use("/auth", require("./src/routes/authRouter"));
// user:
app.use("/users", require("./src/routes/userRouter"));

/* ------------------------------------------------------- */
module.exports = router;
