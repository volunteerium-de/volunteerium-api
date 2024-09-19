const yup = require("yup");
const validateSchema = require("./validator");

const registerSchema = yup.object().shape({
  fullName: yup
    .string()
    .min(3, "FullName must be at least 3 characters long!")
    .max(30, "FullName can be at most 50 characters long!")
    .required("Full name is required!"),
  email: yup
    .string()
    .email("Must be a valid email address!")
    .required("Email is required!"),
  password: yup
    .string()
    .min(6, "Password must be at least 8 characters long!")
    .max(30, "Password can be at most 30 characters long!")
    .matches(/\d+/, "Password must contain at least one number!")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter!")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter!")
    .matches(
      /[@$?!%&*]+/,
      "Password must contain at least one special character (@$?!%&*)!"
    )
    .required("Password is required!"),
  userType: yup
    .string()
    .oneOf(
      ["admin", "organization", "individual"],
      "User type must be one of: admin, organization, individual"
    )
    .required("User type is required!"),
});

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Must be a valid email address!")
    .required("Email is required!"),
  password: yup.string().required("Password is required!"),
});

module.exports = {
  validateRegisterPayload: (data) => validateSchema(registerSchema, data),
  validateLoginPayload: (data) => validateSchema(loginSchema, data),
};
