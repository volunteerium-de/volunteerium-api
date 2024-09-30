"use strict";

const { mongoose } = require("../configs/dbConnection");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const AddressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
    },
    state: {
      type: String,
    },
    streetName: {
      type: String,
    },
    streetNumber: {
      type: String,
    },
    additional: {
      type: String,
    },
    iframeSrc: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
  },
  {
    collection: "addresses",
    timestamps: true,
  }
);

// Helper function to fetch location data
async function fetchLocationData(address) {
  const encodedAddress = encodeURIComponent(address);
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

  try {
    const response = await fetch(nominatimUrl);
    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      return {
        latitude: location.lat,
        longitude: location.lon,
        iframeSrc: `https://www.openstreetmap.org/export/embed.html?bbox=${location.lon}%2C${location.lat}%2C${location.lon}%2C${location.lat}&layer=mapnik`,
      };
    }
    return { latitude: null, longitude: null, iframeSrc: null };
  } catch (error) {
    console.error("Error fetching location data: ", error.message);
    return { latitude: null, longitude: null, iframeSrc: null };
  }
}

// Pre-save middleware
AddressSchema.pre("save", async function (next) {
  if (
    this.isModified("streetNumber") ||
    this.isModified("streetName") ||
    this.isModified("city") ||
    this.isModified("zipCode") ||
    this.isModified("country") ||
    this.isModified("state")
  ) {
    const address = `${this.streetNumber} ${this.streetName}, ${this.zipCode} ${this.city}, ${this.country}`;
    const { latitude, longitude, iframeSrc } = await fetchLocationData(address);
    this.latitude = latitude;
    this.longitude = longitude;
    this.iframeSrc = iframeSrc;
  }
  next();
});

// Pre-update middleware
AddressSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (
    update.streetNumber ||
    update.streetName ||
    update.city ||
    update.zipCode ||
    update.country ||
    update.state
  ) {
    const address = `${update.streetNumber} ${update.streetName}, ${update.zipCode} ${update.city}, ${update.country}`;
    const { latitude, longitude, iframeSrc } = await fetchLocationData(address);
    update.latitude = latitude;
    update.longitude = longitude;
    update.iframeSrc = iframeSrc;
  }
  next();
});

module.exports = mongoose.model("Address", AddressSchema);
