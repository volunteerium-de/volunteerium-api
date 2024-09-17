"use strict";

const router = require("express").Router();
const userController = require("../controllers/userController");

router.patch("/:userId", userController.updateUser);

module.exports = router;
