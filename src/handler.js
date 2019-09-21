'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const schema = require('./schema');
const standups = require('./standups');
const pageCursor = require('./page-cursor');
const validateScope = require('./validate-scope');
const handleAndSendError = require('./handle-error');

const {
  CORS_ALLOW_ORIGIN,
  DYNAMODB_TABLE_NAME,
  DYNAMODB_INVERTED_INDEX_NAME,
  DEFAULT_QUERY_LIMIT,
  CREATE_STANDUP_SCOPE,
  READ_STANDUPS_SCOPE
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

    validateScope(authorizer.scope, CREATE_STANDUP_SCOPE);

    const body = bodyParser.json(event.body);
    const standupData = schema.validateStandup(body);
    const createdItem = await standups.create(
      documentClient,
      DYNAMODB_TABLE_NAME,
      standupData,
      authorizer.userId
    );
    return sendRes.json(201, createdItem);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};

/**
 * Lambda APIG proxy integration that gets all standups for a user.
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
module.exports.getStandups = async (event, context) => {
  try {
    const { authorizer } = event.requestContext;

    validateScope(authorizer.scope, READ_STANDUPS_SCOPE);

    // "queryStringParameters" defaults to "null"
    // So destructuring with a default value doesn't work (must be "undefined")
    const q = event.queryStringParameters || {};
    const { limit = DEFAULT_QUERY_LIMIT, cursor } = q;
    const exclusiveStartKey = pageCursor.decode(cursor);
    const userStandups = await standups.getAllForUser(
      documentClient,
      DYNAMODB_TABLE_NAME,
      DYNAMODB_INVERTED_INDEX_NAME,
      authorizer.userId,
      limit,
      exclusiveStartKey
    );

    const resData = {
      items: userStandups.Items,
      cursor: {
        next: pageCursor.encode(userStandups.LastEvaluatedKey)
      }
    };
    return sendRes.json(200, resData);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};
