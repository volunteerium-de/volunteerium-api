const mongoose = require("mongoose");
const { MONGODB_URI } = require("../../setups");

const dbConnection = function () {
  // Connect:
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("* DB Connected * "))
    .catch((err) => console.log("* DB Not Connected * ", err));
};

/* ------------------------------------------------------- */
module.exports = {
  mongoose,
  dbConnection,
};
