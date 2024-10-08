"use strict";

const router = require("express").Router();

const token = require("../controllers/tokenController");
const idValidation = require("../middlewares/idValidation");
const { isAdmin } = require("../middlewares/permissions");

/* ------------------------------------------------------- */

// URL: /tokens
router.use(isAdmin);

router.route("/").get(token.list).post(token.create);
router.route("/:id").all(idValidation).get(token.read).delete(token.delete);

/* ------------------------------------------------------- */
module.exports = router;
