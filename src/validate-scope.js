'use strict';

const checkSymbols = require('@mooncake-dev/check-symbols');

/**
 * Validate authorization scope.
 *
 * Throws when "scope" does not contain "requiredScope".
 *
 * @param {String} scope - The scope the user has (access token)
 * @param {String} requiredScope - The scope the user requires to do the action
 *
 * @throws {Object} Error
 */
module.exports = function validateScope(scope, requiredScope) {
  const isAuthorized = checkSymbols(scope, requiredScope);
  if (!isAuthorized) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    error.details = `you need scope "${requiredScope}"`;
    throw error;
  }
};
