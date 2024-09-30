"use strict";

const yup = require("yup");
const validateSchema = require("./validator");
const languagesData = require("../helpers/ISO-639-1-languages.json"); // ISO 639-1 language codes

const languageCodes = languagesData.map((lang) => lang.code);

const updateUserSchema = yup.object().shape({
  fullName: yup.string().trim().optional(),
  organizationName: yup.string().trim().optional(),
  email: yup.string().trim().email("Must be a valid email address!").optional(),
  password: yup
    .string()
    .min(6, "Password must be at least 8 characters long!")
    .max(30, "Password can be at most 50 characters long!")
    .matches(/\d+/, "Password must contain at least one number!")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter!")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter!")
    .matches(
      /[@$?!%&*]+/,
      "Password must contain at least one special character (@$?!%&*)!"
    )
    .optional(),
});

const updateUserDetailsSchema = yup.object().shape({
  isFullNameDisplay: yup.boolean().optional(),
  gender: yup.string().oneOf(["male", "female", "n/a"]).optional(),
  ageRange: yup.string().oneOf(["16-25", "26-35", "35+"]).optional(),
  bio: yup.string().max(300).optional(),
  languages: yup.array().of(yup.string().oneOf(languageCodes)).optional(),
  avatar: yup.string().trim().optional(),
  totalPoint: yup.number().min(0, "Total point cannot be negative").optional(),
  interestIds: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "InterestIds must be a valid ObjectId")
    )
    .max(3, "You can add up to 3 interestIds only.")
    .optional(),
  organizationLogo: yup.string().trim().optional(),
  organizationDesc: yup.string().max(1000).trim().optional(),
  organizationUrl: yup
    .string()
    .url("Invalid URL format.") // Validate as URL if not ""
    .optional(),
  addressId: yup
    .string()
    .transform((value) => (value === "" ? null : value)) // transform empty string to null
    .nullable() // Allow null values
    .notRequired() // Allow undefined or missing values
    .matches(/^[0-9a-fA-F]{24}$/, "AddressId must be a valid ObjectId")
    .optional(),
});

module.exports = {
  validateUserUpdatePayload: (data) => validateSchema(updateUserSchema, data),
  validateUserDetailsUpdatePayload: (data) =>
    validateSchema(updateUserDetailsSchema, data),
};
