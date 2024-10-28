"use strict";

const yup = require("yup");
const validateSchema = require("./validator");
const languagesData = require("../helpers/ISO-639-1-languages.json"); // ISO 639-1 language codes
const translations = require("../../locales/translations");

const languageCodes = languagesData.map((lang) => lang.code);

const updateUserSchema = (t) =>
  yup.object().shape({
    fullName: yup.string().trim().optional(),
    organizationName: yup.string().trim().optional(),
    email: yup.string().trim().email(t(translations.yup.email)).optional(),
    password: yup
      .string()
      .min(6, t(translations.yup.minLength.password))
      .max(30, t(translations.yup.maxLength.password))
      .matches(/\d+/, t(translations.yup.password.number))
      .matches(/[a-z]/, t(translations.yup.password.lowercase))
      .matches(/[A-Z]/, t(translations.yup.password.uppercase))
      .matches(/[@$?!%&*]+/, t(translations.yup.password.specialChar))
      .optional(),
  });

const updateUserDetailsSchema = (t) =>
  yup.object().shape({
    isFullNameDisplay: yup.boolean().optional(),
    gender: yup
      .string()
      .oneOf(["male", "female", "n/a"], t(translations.yup.oneOf.gender))
      .optional(),
    ageRange: yup
      .string()
      .oneOf(["16-25", "26-35", "35+"], t(translations.yup.oneOf.ageRange))
      .optional(),
    bio: yup.string().max(300).optional(),
    languages: yup
      .array()
      .of(yup.string().oneOf(languageCodes), t(translations.yup.language))
      .optional(),
    avatar: yup.string().trim().optional(),
    totalPoint: yup
      .number()
      .min(0, t(translations.yup.minLength.totalPoint))
      .optional(),
    interestIds: yup
      .array()
      .of(
        yup.string().matches(/^[0-9a-fA-F]{24}$/, t(translations.yup.interest))
      )
      .max(3, t(translations.yup.maxLength.userInterestIds))
      .optional(),
    organizationLogo: yup.string().trim().optional(),
    organizationDesc: yup.string().max(1000).trim().optional(),
    organizationUrl: yup
      .string()
      .url(t(translations.yup.url)) // Validate as URL if not ""
      .optional(),
    addressId: yup
      .string()
      .transform((value) => (value === "" ? null : value)) // transform empty string to null
      .nullable() // Allow null values
      .notRequired() // Allow undefined or missing values
      .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
        mongoose.Types.ObjectId.isValid(value)
      )
      .optional(),
  });

module.exports = {
  validateUserUpdatePayload: (t, data) =>
    validateSchema(updateUserSchema(t), data),
  validateUserDetailsUpdatePayload: (t, data) =>
    validateSchema(updateUserDetailsSchema(t), data),
};
