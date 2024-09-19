"use strict";

const router = require("express").Router();
const userController = require("../controllers/userController");
const idValidation = require("../middlewares/idValidation");

// URL: /users

router.route("/").get(userController.list);

router.post("/feedback", userController.feedback);
router
  .route("/:id")
  .all(idValidation)
  .get(userController.read)
  .put(userController.update)
  .patch(userController.update)
  .delete(userController.delete);

module.exports = router;
