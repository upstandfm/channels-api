'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createStorageService = require('./storage-service');
const createChannelService = require('./channel-service');
const createRecordingService = require('./recording-service');
const createController = require('./controller');
const { captureError } = require('./utils');

const {
  CORS_ALLOW_ORIGIN,
  WORKSPACES_TABLE_NAME,
  DEFAULT_CHANNELS_LIMIT,
  DEFAULT_RECORDINGS_LIMIT,
  CREATE_CHANNEL_SCOPE,
  READ_CHANNELS_SCOPE,
  READ_CHANNEL_SCOPE,
  READ_CHANNEL_RECORDINGS_SCOPE
} = process.env;

// For more info see:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#constructor-property
const documentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: true
});

const storageService = createStorageService(
  documentClient,
  WORKSPACES_TABLE_NAME
);

const channelService = createChannelService(storageService);
const recordingService = createRecordingService(storageService);

const defaultHeaders = {
  'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN
};

const controller = createController(channelService, recordingService, {
  bodyParser,
  res: createResHandler(defaultHeaders)
});

/**
 * Lambda APIG proxy integration that creates a channel in the user's workspace.
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
module.exports.createChannel = async (event, context) => {
  try {
    const res = await controller.createChannel(
      event,
      context,
      CREATE_CHANNEL_SCOPE
    );
    return res;
  } catch (err) {
    console.log('Failed to create a channel: ', err);
    captureError(context, err);
  }
};

/**
 * Lambda APIG proxy integration that gets all channels in the user's workspace.
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
module.exports.getChannels = async (event, context) => {
  try {
    const res = await controller.getChannels(
      event,
      context,
      READ_CHANNELS_SCOPE,
      DEFAULT_CHANNELS_LIMIT
    );
    return res;
  } catch (err) {
    console.log('Failed to get all channels: ', err);
    captureError(context, err);
  }
};

/**
 * Lambda APIG proxy integration that gets a single channel in the user's
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
module.exports.getChannel = async (event, context) => {
  try {
    const res = await controller.getChannel(event, context, READ_CHANNEL_SCOPE);
    return res;
  } catch (err) {
    console.log('Failed to get channel: ', err);
    captureError(context, err);
  }
};

/**
 * Lambda APIG proxy integration that gets all channel recordings.
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
module.exports.getChannelRecordings = async (event, context) => {
  try {
    const res = await controller.getChannelRecordings(
      event,
      context,
      READ_CHANNEL_RECORDINGS_SCOPE,
      DEFAULT_RECORDINGS_LIMIT
    );
    return res;
  } catch (err) {
    console.log('Failed to get channel recordings: ', err);
    captureError(context, err);
  }
};
