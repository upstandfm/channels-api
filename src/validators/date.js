'use strict';

/**
 * Validate a date key.
 *
 * @param {String} date - Date with format "YYYY-MM-DD"
 *
 * @throws {Error} Validation Error
 */
module.exports = function validateDate(date) {
  const isValid = /^\d\d\d\d-\d\d-\d\d/.test(date);
  if (!isValid) {
    const err = new Error('Invalid Date Format');
    err.details =
      'The valid date format is "YYYY-MM-DD", for example "18-10-2019" or "01-01-2020"';
    err.statusCode = 400;
    throw err;
  }
};
