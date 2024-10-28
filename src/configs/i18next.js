"use strict";

const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const path = require("path");

// custom detector
const CustomLanguageDetector = {
  type: "languageDetector",
  init: () => {}, // Initialization function; currently not used
  detect: (req) => {
    const language = req?.headers?.["accept-language"]?.split(",")[0] || "en";
    return ["en", "de"].includes(language) ? language : "en";
  },
  cacheUserLanguage: () => {},
};

// i18next configs
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .use(CustomLanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "de"], // Languages to be preloaded for better performance
    backend: {
      loadPath: path.join(__dirname, "../../locales/{{lng}}.json"), // Path to the translation JSON files
    },
    detection: {
      order: ["header", "querystring", "cookie"],
      lookupHeader: "accept-language",
      lookupCookie: "i18next",
      caches: ["cookie"],
      checkWhitelist: true,
    },
  });

module.exports = i18nextMiddleware.handle(i18next);
