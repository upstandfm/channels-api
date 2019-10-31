'use strict';

/**
 * Validate a date key.
 *
 * @param {String} date
 *
 * @throws {Error} Validation Error
 */
module.exports = function validateDate(date) {
  const isValid = /^\d\d?-\d\d?-\d\d\d\d/.test(date);
  if (!isValid) {
    const err = new Error('Invalid date format');
    err.details =
      'The "date" must have format "(D)D-(M)M-YYYY", for example "18-10-2019" or "1-1-2020"';
    err.statusCode = 400;
    throw err;
  }
};
