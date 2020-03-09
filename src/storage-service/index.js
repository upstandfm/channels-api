'use strict';

/**
 * Create DynamoDB storage service.
 *
 * @param {Object} client - DynamoDB document client
 * @param {String} tableName
 *
 * @return {Object} Storage service interface
 */
module.exports = function createStorageService(client, tableName) {
  if (!client) {
    throw new Error('Provide a storage client');
  }

  if (!tableName) {
    throw new Error('Provide a table name');
  }

  return {
    /**
     * Insert a channel item.
     *
     * @param {String} workspaceId
     * @param {Object} item
     *
     * @param {String} item.id
     * @param {String} item.createdBy
     * @param {String} item.createdAt
     * @param {String} item.updatedAt
     * @param {String} item.name
     * @param {String} item.isPrivate
     *
     * @return {Promise} Resolves with created item
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
     */
    insertChannel(workspaceId, item) {
      const params = {
        TableName: tableName,

        // Prevent replacing an existing item
        // The write will ONLY succeeds when the condition expression evaluates
        // to "true"
        // For more info see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html#Expressions.ConditionExpressions.PreventingOverwrites
        ConditionExpression: 'attribute_not_exists(id)',

        Item: {
          pk: `workspace#${workspaceId}`,
          sk: `channel#${item.id}`,
          ...item
        }
      };

      return client
        .put(params)
        .promise()
        .then(() => item)
        .catch(err => {
          if (err.code === 'ConditionalCheckFailedException') {
            const duplicateErr = new Error('Workspace member already exists');
            duplicateErr.statusCode = 400;
            throw duplicateErr;
          }

          throw err;
        });
    },

    /**
     * Get all workspace channel items.
     *
     * @param {String} workspaceId
     * @param {Number} limit - How many items to get
     * @param {Object} exclusiveStartKey - DynamoDB primary key
     *
     * @return {Promise} Resolves with items
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
     */
    getWorkspaceChannels(workspaceId, limit, exclusiveStartKey) {
      const params = {
        TableName: tableName,

        // For reserved keywords see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
        ExpressionAttributeNames: {
          '#n': 'name'
        },

        ExpressionAttributeValues: {
          ':pk': `workspace#${workspaceId}`,
          ':sk_start': 'channel#'
        },
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
        ProjectionExpression:
          'id, createdBy, createdAt, updatedAt, #n, isPrivate',
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey
      };
      return client.query(params).promise();
    },

    /**
     * Get channel item.
     *
     * @param {String} workspaceId
     * @param {String} channelId
     *
     * @return {Promise} Resolves with item
     *
     * For SDK documentation see:
     * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
     */
    getChannel(workspaceId, channelId) {
      const params = {
        TableName: tableName,

        // For reserved keywords see:
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
        ExpressionAttributeNames: {
          '#n': 'name'
        },

        Key: {
          pk: `workspace#${workspaceId}`,
          sk: `channel#${channelId}`
        },
        ProjectionExpression:
          'id, createdBy, createdAt, updatedAt, #n, isPrivate'
      };
      return client
        .get(params)
        .promise()
        .then(res => res.Item);
    }
  };
};
