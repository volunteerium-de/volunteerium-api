const fetch = require("node-fetch");

module.exports = async (req, res, next) => {
  const { streetNumber, streetName, city, zipCode, country, state } = req.body;

  let address = `${streetNumber} ${streetName}, ${zipCode} ${city}, ${country}`;
  if (state) {
    address = `${streetNumber} ${streetName}, ${zipCode} ${city}, ${state}, ${country}`;
  }

  // Convert Address URL to encodeURIComponent
  const encodedAddress = encodeURIComponent(address);

  // Nominatim API
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

  try {
    const response = await fetch(nominatimUrl);
    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      const lat = location.lat;
      const lon = location.lon;

      // Generate iFrame src URL
      const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon}%2C${lat}%2C${lon}%2C${lat}&layer=mapnik`;

      console.log("iframe generated: ", iframeSrc);

      req.body.iframeSrc = iframeSrc;
    } else {
      req.body.iframeSrc = null;
      console.log("iframe couldn't be generated: Address not found!", address);
    }
  } catch (error) {
    req.body.iframeSrc = null;
    console.log(
      "iframe couldn't be generated due to API Error: ",
      error.message
    );
  }

  next();
};
