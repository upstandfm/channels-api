'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const schema = require('./schema');
const standups = require('./standups');
const updates = require('./updates');
const pageCursor = require('./page-cursor');
const handleAndSendError = require('./handle-error');

const {
  validateAuthorizerData,
  validateScope,
  validateDate
} = require('./validators');

const {
  CORS_ALLOW_ORIGIN,
  WORKSPACES_TABLE_NAME,
  DEFAULT_QUERY_LIMIT,
  CREATE_STANDUP_SCOPE,
  READ_STANDUPS_SCOPE,
  READ_STANDUP_SCOPE,
  READ_UPDATES_SCOPE
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
 * Lambda APIG proxy integration that creates a standup in the user's workspace.
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

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, CREATE_STANDUP_SCOPE);

    const body = bodyParser.json(event.body);
    const standupData = schema.validateStandup(body);
    const createdItem = await standups.create(
      documentClient,
      WORKSPACES_TABLE_NAME,
      standupData,
      authorizer.workspaceId,
      authorizer.userId
    );
    return sendRes.json(201, createdItem);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};

/**
 * Lambda APIG proxy integration that gets all standups in the user's workspace.
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

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, READ_STANDUPS_SCOPE);

    // "queryStringParameters" defaults to "null"
    // So destructuring with a default value doesn't work (must be "undefined")
    const q = event.queryStringParameters || {};
    const { limit = DEFAULT_QUERY_LIMIT, cursor } = q;
    const exclusiveStartKey = pageCursor.decode(cursor);
    const workspaceStandups = await standups.getAll(
      documentClient,
      WORKSPACES_TABLE_NAME,
      authorizer.workspaceId,
      limit,
      exclusiveStartKey
    );

    const resData = {
      items: workspaceStandups.Items,
      cursor: {
        next: pageCursor.encode(workspaceStandups.LastEvaluatedKey)
      }
    };
    return sendRes.json(200, resData);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};

/**
 * Lambda APIG proxy integration that gets a single standup in the user's
 * workspace.
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
module.exports.getStandup = async (event, context) => {
  try {
    const { authorizer } = event.requestContext;

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, READ_STANDUP_SCOPE);

    const { standupId } = event.pathParameters;
    const workspaceStandup = await standups.getOne(
      documentClient,
      WORKSPACES_TABLE_NAME,
      authorizer.workspaceId,
      standupId
    );

    if (!workspaceStandup.Item) {
      const err = new Error('Not Found');
      err.statusCode = 404;
      err.details = `You might not have access to this standup, or it doesn't exist.`;
      throw err;
    }

    return sendRes.json(200, workspaceStandup.Item);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};

/**
 * Lambda APIG proxy integration that gets all standup updates for a date.
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
module.exports.getStandupUpdates = async (event, context) => {
  try {
    const { authorizer } = event.requestContext;

    validateAuthorizerData(authorizer);
    validateScope(authorizer.scope, READ_UPDATES_SCOPE);

    // "queryStringParameters" defaults to "null"
    // So destructuring with a default value doesn't work (must be "undefined")
    const q = event.queryStringParameters || {};
    const { date } = q;

    validateDate(date);

    const { standupId } = event.pathParameters;
    const updatesData = await updates.getAllForDate(
      documentClient,
      WORKSPACES_TABLE_NAME,
      authorizer.workspaceId,
      standupId,
      date
    );

    const resData = {
      date,
      items: updatesData.Items
    };
    return sendRes.json(200, resData);
  } catch (err) {
    return handleAndSendError(context, err, sendRes);
  }
};
