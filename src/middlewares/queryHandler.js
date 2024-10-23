"use strict";

/* ---------------------------------- */
/*          Volunteerium API          */
/*       QueyHandler Middleware       */
/* ---------------------------------- */
const { PAGE_SIZE } = require("../../setups");
const { CustomError } = require("../errors/customError");

module.exports = async (req, res, next) => {
  /* FILTERING & SEARCHING & SORTING & PAGINATION */

  //! Example Usage
  //* GET /events?search[title]=charity&search[location]=berlin&filter[startDate]=2024-10-10&filter[endDate]=2024-10-28&filter[category]=health,animal,education&sort[createdAt]=desc&page=1&limit=5
  //? "Events that take place in Berlin, between October 10 and October 28, 2024, contain the keyword 'charity', and belong to the categories 'health', 'animal', or 'education', will be returned, sorted from newest to oldest. A maximum of 5 events will be displayed per page."

  // ### FILTERING ###

  // URL?filter[startDate]=value1&filter[endDate]=value2&filter[category]=value3
  const filter = req.query?.filter || {};

  const filterCriteria = {};

  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    if (isNaN(startDate.getTime())) {
      throw new CustomError("Invalid startDate format in query!", 400);
    }
    filterCriteria.startDate = { $gte: startDate };
  }

  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    if (isNaN(endDate.getTime())) {
      throw new CustomError("Invalid endDate format in query!", 400);
    }
    filterCriteria.endDate = { $lte: endDate };
  }

  if (filter.category) {
    if (typeof filter.category !== "string" || filter.category.trim() === "") {
      throw new CustomError("Invalid category format!", 400);
    }
    const categories = filter.category
      .split(",")
      .map((category) => category.trim());

    const Interest = require("../models/interestModel");

    const interestIds = await Interest.find({
      name: { $in: categories.map((c) => new RegExp(c, "i")) }, // case insensitive
    });

    const matchingInterestIds = interestIds.map((interest) => interest._id);

    if (matchingInterestIds.length) {
      filterCriteria.interestIds = { $in: matchingInterestIds };
    }
  }

  if (filter.languages) {
    const languages = filter.languages.split(",").map((lang) => lang.trim());
    filterCriteria["languages"] = {
      $in: languages,
    };
  }

  for (let key in filter) {
    // other filters like userId, name ...
    if (!["startDate", "endDate", "category", "languages"].includes(key)) {
      if (typeof filter[key] !== "string" || filter[key].trim() === "") {
        throw new CustomError(`Invalid filter format for ${key}!`, 400);
      }
      filterCriteria[key] = filter[key];
    }
  }

  // console.log(filter)
  // console.log(filterCriteria);

  // ### SEARCHING ###

  // URL?search[key1]=value1&search[key2]=value2
  // https://www.mongodb.com/docs/manual/reference/operator/query/regex/

  const search = req.query?.search || {};
  const searchCriteria = {};

  // console.log(search)
  // title, startDate, endDate, addressId = {city: ..., country: ..., zipCode: ...}, interestsIds = [{name: ...},{name:...}]

  if (search.title) {
    if (typeof search.title !== "string" || search.title.trim() === "") {
      throw new CustomError("Invalid title format!", 400);
    }
    searchCriteria.title = { $regex: search.title, $options: "i" };
  }

  if (search.location) {
    if (typeof search.location !== "string" || search.location.trim() === "") {
      throw new CustomError("Invalid location format!", 400);
    }
    const locationRegex = { $regex: search.location, $options: "i" };
    // Get matching address IDs from Address model
    const Address = require("../models/addressModel");
    const matchingAddresses = await Address.find({
      $or: [
        { city: locationRegex },
        { country: locationRegex },
        { zipCode: locationRegex },
      ],
    });

    if (matchingAddresses.length) {
      const matchingAddressIds = matchingAddresses.map((addr) => addr._id);
      // console.log(matchingAddressIds);
      filterCriteria.addressId = { $in: matchingAddressIds };
    } else {
      filterCriteria.addressId = null;
    }
  }

  // console.log(searchCriteria);

  // ### SORTING ###

  // URL?sort[key1]=asc&sort[key2]=desc
  // asc: A-Z - desc: Z-A
  const sort = req.query?.sort || {};
  // console.log(sort)

  // Validate sort format
  for (let key in sort) {
    if (!["asc", "desc"].includes(sort[key].toLowerCase())) {
      throw new CustomError(
        "Invalid sort direction. Use 'asc' or 'desc'.",
        400
      );
    }
  }

  // ### PAGINATION ###

  // URL?page=3&limit=10
  let limit = Number(req.query?.limit);
  // console.log(limit)
  if (isNaN(limit) || limit <= 0) {
    limit = Number(PAGE_SIZE || 5);
  }
  // console.log(typeof limit, limit)

  let page = Number(req.query?.page);
  page = page > 0 ? page - 1 : 0; // For backend we use (page - 1)
  // console.log(typeof page, page)

  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : page * limit;
  // console.log(typeof skip, skip)

  /* FILTERING & SEARCHING & SORTING & PAGINATION */

  // Run for output:
  res.getModelList = async (Model, customFilter = {}, populate = null) => {
    if (Model.modelName === "Interest") {
      return await Model.find({
        ...filterCriteria,
        ...searchCriteria,
        ...customFilter,
      }).populate(populate);
    }

    return await Model.find({
      ...filterCriteria,
      ...searchCriteria,
      ...customFilter,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
  };

  // Details:
  res.getModelListDetails = async (Model, customFilter = {}) => {
    const data = await Model.find({
      ...filterCriteria,
      ...searchCriteria,
      ...customFilter,
    });

    let details = {};

    if (Model.modelName === "Interest") {
      details = {
        filter,
        search,
        sort,
        totalRecords: data.length,
      };
    } else {
      details = {
        filter,
        search,
        sort,
        skip,
        limit,
        page,
        pages: {
          previous: page > 0 ? page : false,
          current: page + 1,
          next: page + 2,
          total: Math.ceil(data.length / limit),
        },
        totalRecords: data.length,
      };

      details.pages.next =
        details.pages.next > details.pages.total ? false : details.pages.next;
      if (details.totalRecords <= limit) details.pages = false;
    }

    return details;
  };

  next();
};
