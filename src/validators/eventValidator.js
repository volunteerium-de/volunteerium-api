const yup = require("yup");
const validateSchema = require("./validator");
const { mongoose } = require("../configs/dbConnection");

const languagesData = require("../helpers/ISO-639-1-languages.json");
const countryDialCodes = require("../helpers/country_dial.json");

const phoneRegex = /^\+\d{1,4} \d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const languageCodes = languagesData.map((lang) => lang.code);

const eventSchema = yup.object().shape({
  createdBy: yup
    .string()
    .required("Created by is required")
    .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
      mongoose.Types.ObjectId.isValid(value)
    ),
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim().required("Description is required"),
  // addressId: yup.string().when("isOnline", {
  //   is: false,
  //   then: yup
  //     .string()
  //     .required("Address is required if the event is not online")
  //     .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
  //       mongoose.Types.ObjectId.isValid(value)
  //     ),
  // }),
  interestIds: yup.array().of(
    yup
      .string()
      // .required()
      .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
        mongoose.Types.ObjectId.isValid(value)
      )
  ),
  // .required("At least one interest ID is required"),
  contactName: yup.string().trim(),
  // .required("Contact name is required"),
  contactEmail: yup
    .string()
    .trim()
    // .required("Contact email is required")
    .matches(emailRegex, "Invalid email format"),
  contactPhone: yup
    .string()
    .trim()
    .matches(phoneRegex, "Invalid phone number format")
    .test("is-valid-country-code", "Invalid country code", (value) => {
      if (!value) return true; // Allow empty phone number
      const countryCode = value.split(" ")[0];
      return countryDialCodes.some(
        (country) => country.dial_code === countryCode
      );
    }),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date must be after start date"),
  languages: yup
    .array()
    .of(yup.string().oneOf(languageCodes, "Invalid language code")),
  eventPhoto: yup.string().trim(),
  isOnline: yup.boolean().default(false),
  isRepeat: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  maxParticipant: yup
    .number()
    .required("Max participant is required")
    .min(1, "Max participant must be at least 1"),
  eventParticipantIds: yup
    .array()
    .of(
      yup
        .string()
        .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
          mongoose.Types.ObjectId.isValid(value)
        )
    ),
  eventFeedbackIds: yup
    .array()
    .of(
      yup
        .string()
        .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
          mongoose.Types.ObjectId.isValid(value)
        )
    ),
});

// Update schema with all fields optional
const updateEventSchema = yup.object().shape({
  createdBy: yup
    .string()
    .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
      value ? mongoose.Types.ObjectId.isValid(value) : true
    ),
  title: yup.string().trim(),
  description: yup.string().trim(),
  interestIds: yup
    .array()
    .of(
      yup
        .string()
        .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
          value ? mongoose.Types.ObjectId.isValid(value) : true
        )
    ),
  contactName: yup.string().trim(),
  contactEmail: yup.string().trim().matches(emailRegex, "Invalid email format"),
  contactPhone: yup
    .string()
    .trim()
    .matches(phoneRegex, "Invalid phone number format")
    .test("is-valid-country-code", "Invalid country code", (value) => {
      if (!value) return true; // Allow empty phone number
      const countryCode = value.split(" ")[0];
      return countryDialCodes.some(
        (country) => country.dial_code === countryCode
      );
    }),
  startDate: yup.date(),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "End date must be after start date"),
  languages: yup
    .array()
    .of(yup.string().oneOf(languageCodes, "Invalid language code")),
  eventPhoto: yup.string().trim(),
  isOnline: yup.boolean().default(false),
  isRepeat: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  maxParticipant: yup.number().min(1, "Max participant must be at least 1"),
  eventParticipantIds: yup
    .array()
    .of(
      yup
        .string()
        .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
          mongoose.Types.ObjectId.isValid(value)
        )
    ),
  eventFeedbackIds: yup
    .array()
    .of(
      yup
        .string()
        .test("is-mongo-id", "Invalid MongoDB ID", (value) =>
          mongoose.Types.ObjectId.isValid(value)
        )
    ),
});

module.exports = {
  validateEventPayload: (data) => validateSchema(eventSchema, data),
  validateUpdateEventPayload: (data) => validateSchema(updateEventSchema, data),
};
