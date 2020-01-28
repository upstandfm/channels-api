'use strict';

/**
 * Validate a date key.
 *
 * @param {String} date - Date with format "YYYY-MM-DD"
 *
 * @throws {Error} Validation Error
 */
module.exports = function validateDate(date) {
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!isValid) {
    const err = new Error('Invalid Date Format');
    err.details =
      'The valid date format is "YYYY-MM-DD", for example "2020-01-28"';
    err.statusCode = 400;
    throw err;
  }
};
