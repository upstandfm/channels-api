'use strict';

const { captureError, pageCursor } = require('../utils');
const { validateAuthorizerData, validateScope } = require('../validators');
const schema = require('../schema');

/**
 * Create a controller to handle HTTP requests.
 *
 * @param {Object} channel - Channel service
 * @param {Object} recordings - Recording service
 * @param {Object} options
 *
 * @param {Object} options.bodyParser
 * @param {Function} options.bodyParser.json - Parse a JSON string
 *
 * @param {Object} options.res
 * @param {Function} options.res.json - Send a JSON response
 *
 * @return {Object} Controller interface
 */
module.exports = function createController(channel, recording, options = {}) {
  if (!channel) {
    throw new Error('Provide a channel service');
  }

  if (!recording) {
    throw new Error('Provide a recording service');
  }

  const { bodyParser = {}, res = {} } = options;

  if (!bodyParser.json || typeof bodyParser.json !== 'function') {
    throw new Error('Provide a body parser function to parse JSON strings');
  }

  if (!res.json || typeof res.json !== 'function') {
    throw new Error('Provide a function to send JSON responses');
  }

  return {
    /**
     * Create a channel.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async createChannel(event, context, requiredScope) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        const body = bodyParser.json(event.body);
        const data = schema.validateChannel(body);
        const item = await channel.create(
          authorizer.workspaceId,
          authorizer.userId,
          data
        );

        return res.json(201, item);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    },

    /**
     * Get all channels.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     * @param {Number} defaultLimit - The default pagination limit
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async getChannels(event, context, requiredScope, defaultLimit) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        // "queryStringParameters" defaults to "null"
        // So destructuring with a default value doesn't work (must be "undefined")
        const q = event.queryStringParameters || {};
        const { limit = defaultLimit, cursor } = q;
        const exclusiveStartKey = pageCursor.decode(cursor);

        const { Items, LastEvaluatedKey } = await channel.getAll(
          authorizer.workspaceId,
          limit,
          exclusiveStartKey
        );

        const resData = {
          items: Items,
          cursor: {
            next: pageCursor.encode(LastEvaluatedKey)
          }
        };

        return res.json(200, resData);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    },

    /**
     * Get a single channel.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async getChannel(event, context, requiredScope) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        const item = await channel.get(
          authorizer.workspaceId,
          event.pathParameters.channelId
        );

        if (!item) {
          const err = new Error('Not Found');
          err.statusCode = 404;
          err.details = `You might not have access to this channel, or it doesn't exist.`;
          throw err;
        }

        return res.json(200, item);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    },

    /**
     * Get all channel recordings.
     *
     * @param {Object} event - Lambda HTTP input
     * @param {Object} context - Lambda context
     * @param {String} requiredScope - The scope a consumer must have to perform this action
     * @param {Number} defaultLimit - The default pagination limit
     *
     * @return {Promise} Resolves with HTTP output object
     *
     */
    async getChannelRecordings(event, context, requiredScope, defaultLimit) {
      try {
        const { authorizer } = event.requestContext;

        validateAuthorizerData(authorizer);
        validateScope(authorizer.scope, requiredScope);

        // "queryStringParameters" defaults to "null"
        // So destructuring with a default value doesn't work (must be "undefined")
        const q = event.queryStringParameters || {};
        const { limit = defaultLimit, cursor } = q;
        const exclusiveStartKey = pageCursor.decode(cursor);

        const { Items, LastEvaluatedKey } = await recording.getAll(
          authorizer.workspaceId,
          event.pathParameters.channelId,
          limit,
          exclusiveStartKey
        );

        const resData = {
          items: Items,
          cursor: {
            next: pageCursor.encode(LastEvaluatedKey)
          }
        };

        return res.json(200, resData);
      } catch (err) {
        captureError(context, err);

        const statusCode = err.statusCode || 500;
        const resData = {
          message: err.message,
          details: err.details
        };
        return res.json(statusCode, resData);
      }
    }
  };
};
