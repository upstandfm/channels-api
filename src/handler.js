'use strict';

const createResHandler = require('@mooncake-dev/lambda-res-handler');

const { CORS_ALLOW_ORIGIN } = process.env;

const defaultHeaders = {
  'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN
};
const sendRes = createResHandler(defaultHeaders);

/**
 * Lambda APIG proxy integration that returns a status.
 *
 * @param {Object} event - HTTP input
 * @param {Object} event - Lambda context
 *
 * @return {Object} HTTP output
 *
 * For more info on HTTP input see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 *
 * For more info on Lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 * For more info on HTTP output see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
 */
module.exports.status = async (event, context) => {
  try {
    return sendRes.json(200, { status: 'ok' });
  } catch (err) {
    // Provided by Serverless Framework
    context.captureError(err);

    const statusCode = err.statusCode || 500;
    const data = {
      error: err.message,
      details: err.details
    };
    return sendRes.json(statusCode, data);
  }
};
