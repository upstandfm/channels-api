'use strict';

/**
 * Validate authorizer data.
 *
 * @param {Object} data
 *
 * @throws {Error} Validation Error
 */
module.exports = function validateAuthorizerData(data) {
  const detailsMsg = `Corrupt authorizer data. Contact "support@upstand.fm"`;

  if (!data) {
    const err = new Error('Missing authorizer data');
    err.statusCode = 500;
    err.details = detailsMsg;
    throw err;
  }

  if (!data.userId) {
    const err = new Error('Missing user id');
    err.statusCode = 500;
    err.details = detailsMsg;
    throw err;
  }

  if (!data.workspaceId) {
    const err = new Error('Missing workspace id');
    err.statusCode = 500;
    err.details = detailsMsg;
    throw err;
  }
};
