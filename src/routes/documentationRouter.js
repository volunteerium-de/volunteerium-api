"use strict";

const router = require("express").Router();
const { VERSION } = require("../../setups");
// URL: /documentations

router.all(`/api/${VERSION}`, (req, res) => {
  res.send({
    swagger: `/api/${VERSION}/documentations/swagger`,
    redoc: `/api/${VERSION}/documentations/redoc`,
    json: `/api/${VERSION}/documentations/json`,
  });
});

// JSON:
router.use("/json", (req, res) => {
  res.sendFile("./src/configs/swagger.json", { root: "." });
});

// Redoc:
const redoc = require("redoc-express");
router.use(
  "/redoc",
  redoc({ specUrl: `/api/${VERSION}/documentations/json`, title: "API Docs" })
);

// Swagger:
const swaggerUi = require("swagger-ui-express");
router.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(require("../configs/swagger.json"), {
    swaggerOptions: { persistAuthorization: true },
  })
);

module.exports = router;
