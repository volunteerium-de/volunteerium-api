const yup = require("yup");

module.exports = {
  isRegisterPayloadValid: (data) =>
    yup
      .object()
      .shape({
        fullName: yup.string().required(),
        email: yup
          .string()
          .email("Must be a valid email address!")
          .required("Email is required!"),
        password: yup
          .string()
          .min(8, "Password must be at least 8 characters long!")
          .max(50, "Password can be at most 50 characters long!")
          .matches(/\d+/, "Password must contain at least one number!")
          .matches(
            /[a-z]/,
            "Password must contain at least one lowercase letter!"
          )
          .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase letter!"
          )
          .matches(
            /[@$?!%&*]+/,
            "Password must contain at least one special character (@$!%*?&)!"
          )
          .required("Password is required!"),
      })
      .isValid(data),

  isLoginPayloadValid: (data) =>
    yup
      .object()
      .shape({
        email: yup
          .string()
          .email("Must be a valid email address!")
          .required("Email is required!"),
        password: yup.string().required("Password is required!"),
      })
      .isValid(data),
};
