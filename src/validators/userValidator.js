const yup = require("yup");

module.exports = {
  isUpdatePayloadValid: (data) =>
    yup
      .object()
      .shape({
        fullName: yup.string().optional(),
        email: yup.string().email("Must be a valid email address!").optional(),
      })
      .isValid(data),
};
