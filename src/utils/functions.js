// To capture specific object/-s in AWS-Bucket
const extractDateNumber = (url) => {
  const regex = /\/(\d+)-/; // Regex to find numbers between '/' and '-'
  const match = url.match(regex); // Match the regex with the given URL
  if (match) {
    return match[1]; // Return the first captured group
  }
  return null; // Return null if no match is found
};

const isTokenExpired = (token) => {
  return token.expiresIn < Date.now();
};

const isEmpty = (value) =>
  value === undefined || value === null || value === "";

// Export the functions
module.exports = {
  isTokenExpired,
  isEmpty,
  extractDateNumber,
};
