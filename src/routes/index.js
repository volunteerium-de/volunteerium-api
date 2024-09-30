"use strict";

const router = require("express").Router();
/* ------------------------------------------------------- */

// URL: /

// token:
router.use("/tokens", require("./tokenRouter"));
// auth:
router.use("/auth", require("./authRouter"));
// user:
router.use("/users", require("./userRouter"));
// userDetails:
router.use("/details/users", require("./userDetailsRouter"));
// events:
router.use("/events", require("./eventRouter"));
// interests:
router.use("/interests", require("./interestRouter"));
// addresses:
router.use("/addresses", require("./addressRouter"));

/* ------------------------------------------------------- */
module.exports = router;
