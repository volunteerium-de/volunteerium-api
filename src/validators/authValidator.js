const yup = require("yup");
const validateSchema = require("./validator");
const translations = require("../../locales/translations");

const registerSchema = (t) =>
  yup.object().shape({
    fullName: yup
      .string()
      .trim()
      .min(3, t(translations.yup.minLength.fullName))
      .max(30, t(translations.yup.maxLength.fullName)),
    organizationName: yup
      .string()
      .trim()
      .min(3, t(translations.yup.minLength.organizatioName))
      .max(30, t(translations.yup.maxLength.organizatioName)),
    email: yup
      .string()
      .trim()
      .email(t(translations.yup.email))
      .required(t(translations.yup.required.email)),
    password: yup
      .string()
      .min(6, t(translations.yup.minLength.password))
      .max(30, t(translations.yup.maxLength.password))
      .matches(/\d+/, t(translations.yup.password.number))
      .matches(/[a-z]/, t(translations.yup.password.lowercase))
      .matches(/[A-Z]/, t(translations.yup.password.uppercase))
      .matches(/[@$?!%&*]+/, t(translations.yup.password.specialChar))
      .required(t(translations.yup.required.password)),
    userType: yup
      .string()
      .oneOf(
        ["admin", "organization", "individual"],
        t(translations.yup.oneOf.userType)
      )
      .required(t(translations.yup.required.userType)),
  });

const loginSchema = (t) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t(translations.yup.email))
      .required(t(translations.yup.required.email)),
    password: yup.string().required(t(translations.yup.required.password)),
  });

module.exports = {
  validateRegisterPayload: (t, data) => validateSchema(registerSchema(t), data),
  validateLoginPayload: (t, data) => validateSchema(loginSchema(t), data),
};
