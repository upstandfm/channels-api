'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const checkSymbols = require('@mooncake-dev/check-symbols');
const schema = require('./schema');
const standups = require('./standups');

const {
  CORS_ALLOW_ORIGIN,
  DYNAMODB_TABLE_NAME,
  CREATE_STANDUP_SCOPE
} = process.env;

const defaultHeaders = {
  'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN
};
const sendRes = createResHandler(defaultHeaders);

// For more info see:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#constructor-property
const documentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: true
});

/**
 * Lambda APIG proxy integration that creates a standup.
 *
 * @param {Object} event - HTTP input
 * @param {Object} context - AWS lambda context
 *
 * @return {Object} HTTP output
 *
 * For more info on HTTP input see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 *
 * For more info on AWS lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 * For more info on HTTP output see:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
 */
module.exports.createStandup = async (event, context) => {
  try {
    const { authorizer } = event.requestContext;
    const { scope, userId } = authorizer;

    const isAuthorized = checkSymbols(scope, CREATE_STANDUP_SCOPE);
    if (!isAuthorized) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      error.details = `you need scope "${CREATE_STANDUP_SCOPE}"`;
      throw error;
    }

    const body = bodyParser.json(event.body);
    const standupData = schema.validateStandup(body);
    const createdItem = await standups.create(
      documentClient,
      DYNAMODB_TABLE_NAME,
      standupData,
      userId
    );
    return sendRes.json(201, createdItem);
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
