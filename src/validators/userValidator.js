const yup = require("yup");
const validateSchema = require("./validator");

const updateUserSchema = yup.object().shape({
  fullName: yup.string().optional(),
  email: yup.string().email("Must be a valid email address!").optional(),
  password: yup
    .string()
    .min(6, "Password must be at least 8 characters long!")
    .max(30, "Password can be at most 50 characters long!")
    .matches(/\d+/, "Password must contain at least one number!")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter!")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter!")
    .matches(
      /[@$?!%&*]+/,
      "Password must contain at least one special character (@$!%*?&)!"
    )
    .optional(),
});

module.exports = {
  validateUserUpdatePayload: (data) => validateSchema(updateUserSchema, data),
};
