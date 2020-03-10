'use strict';

/**
 * Capture an error by sending it to the Serverless Dashboard.
 *
 * Captured errors can be found here:
 * https://dashboard.serverless.com/tenants/upstandfm/applications/api/services/channels-api/stage/prod/region/eu-central-1#service-overview=alerts
 *
 * @param {Object} context - AWS lambda context
 * @param {Object} err
 */
module.exports = function captureError(context, err) {
  if (!context || !err) {
    return;
  }

  // Provided by Serverless Framework
  if (context.captureError) {
    context.captureError(err);
  }
};
