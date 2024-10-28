const yup = require("yup");
const validateSchema = require("./validator");
const { mongoose } = require("../configs/dbConnection");
const languagesData = require("../helpers/ISO-639-1-languages.json");
const countryDialCodes = require("../helpers/country_dial.json");
const translations = require("../../locales/translations");

const phoneRegex = /^\+\d{1,4} \d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const languageCodes = languagesData.map((lang) => lang.code);

const eventSchema = (t) =>
  yup.object().shape({
    createdBy: yup
      .string()
      .required(t(translations.yup.required.createdBy))
      .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
        mongoose.Types.ObjectId.isValid(value)
      ),
    title: yup.string().trim().required(t(translations.yup.required.title)),
    description: yup
      .string()
      .trim()
      .required(t(translations.yup.required.description)),
    interestIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            mongoose.Types.ObjectId.isValid(value)
          )
      )
      .max(3, t(translations.yup.maxLength.eventInterestIds))
      .min(1, t(translations.yup.minLength.interestIds)),
    contactName: yup.string().trim(),
    contactEmail: yup
      .string()
      .trim()
      .matches(emailRegex, t(translations.yup.email)),
    contactPhone: yup
      .string()
      .trim()
      .matches(phoneRegex, t(translations.yup.phone))
      .test("is-valid-country-code", t(translations.yup.country), (value) => {
        if (!value) return true; // Allow empty phone number
        const countryCode = value.split(" ")[0];
        return countryDialCodes.some(
          (country) => country.dial_code === countryCode
        );
      }),
    startDate: yup.date().required(t(translations.yup.required.startDate)),
    endDate: yup
      .date()
      .required(t(translations.yup.required.endDate))
      .min(yup.ref("startDate"), t(translations.yup.minLength.endDate)),
    languages: yup
      .array()
      .of(yup.string().oneOf(languageCodes, t(translations.yup.language))),
    eventPhoto: yup.string().trim(),
    isOnline: yup.boolean().default(false),
    isRepeat: yup.boolean().default(false),
    isActive: yup.boolean().default(true),
    maxParticipant: yup
      .number()
      .required(t(translations.yup.required.maxParticipant))
      .min(1, t(translations.yup.minLength.maxParticipant)),
    eventParticipantIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            mongoose.Types.ObjectId.isValid(value)
          )
      ),
    eventFeedbackIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            mongoose.Types.ObjectId.isValid(value)
          )
      ),
  });

// Update schema with all fields optional
const updateEventSchema = (t) =>
  yup.object().shape({
    createdBy: yup
      .string()
      .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
        value ? mongoose.Types.ObjectId.isValid(value) : true
      ),
    title: yup.string().trim(),
    description: yup.string().trim(),
    interestIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            value ? mongoose.Types.ObjectId.isValid(value) : true
          )
      )
      .max(3, t(translations.yup.maxLength.eventInterestIds))
      .min(1, t(translations.yup.minLength.interestIds)),
    contactName: yup.string().trim(),
    contactEmail: yup
      .string()
      .trim()
      .matches(emailRegex, t(translations.yup.email)),
    contactPhone: yup
      .string()
      .trim()
      .matches(phoneRegex, t(translations.yup.phone))
      .test("is-valid-country-code", t(translations.yup.country), (value) => {
        if (!value) return true; // Allow empty phone number
        const countryCode = value.split(" ")[0];
        return countryDialCodes.some(
          (country) => country.dial_code === countryCode
        );
      }),
    startDate: yup.date(),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), t(translations.yup.minLength.endDate)),
    languages: yup
      .array()
      .of(yup.string().oneOf(languageCodes, t(translations.yup.language))),
    eventPhoto: yup.string().trim(),
    isOnline: yup.boolean().default(false),
    isRepeat: yup.boolean().default(false),
    isActive: yup.boolean().default(true),
    maxParticipant: yup
      .number()
      .min(1, t(translations.yup.minLength.maxParticipant)),
    eventParticipantIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            mongoose.Types.ObjectId.isValid(value)
          )
      ),
    eventFeedbackIds: yup
      .array()
      .of(
        yup
          .string()
          .test("is-mongo-id", t(translations.yup.isMongoId), (value) =>
            mongoose.Types.ObjectId.isValid(value)
          )
      ),
  });

module.exports = {
  validateEventPayload: (t, data) => validateSchema(eventSchema(t), data),
  validateUpdateEventPayload: (t, data) =>
    validateSchema(updateEventSchema(t), data),
};
