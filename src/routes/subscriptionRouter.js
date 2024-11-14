"use strict";

const router = require("express").Router();

const {
  list,
  subscribe,
  unsubscribe,
} = require("../controllers/subscriptionController");
const { isAdmin, isLogin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /subscriptions

router.get("/", isLogin, isAdmin, list);
router.post("/", subscribe);
router.delete("/:id", unsubscribe);

/* ------------------------------------------------------- */
module.exports = router;
