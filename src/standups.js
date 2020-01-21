'use strict';

const shortid = require('shortid');

module.exports = {
  /**
   * Create a standup in a workspace.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {Object} standupData
   * @param {String} workspaceId
   * @param {String} userId
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  create(client, tableName, standupData, workspaceId, userId) {
    const standupId = shortid.generate();

    const now = new Date().toISOString();
    const insertData = {
      ...standupData,
      id: standupId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      isPrivate: true
    };

    const params = {
      TableName: tableName,
      Item: {
        pk: `workspace#${workspaceId}`,
        sk: `standup#${standupId}`,
        ...insertData
      }
    };

    return client
      .put(params)
      .promise()
      .then(() => {
        return insertData;
      });
  },

  /**
   * Get all standups in a workspace.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {Number} limit - How many items to get
   * @param {Object} exclusiveStartKey - DynamoDB primary key
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAll(client, tableName, workspaceId, limit, exclusiveStartKey) {
    const params = {
      TableName: tableName,
      // For reserved keywords see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':pk': `workspace#${workspaceId}`,
        ':sk_start': 'standup#'
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
   * Get a single standup in a workspace.
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {String} standupId
   *
   * @return {Promise} Resolves with DynamoDB data
   */
  getOne(client, tableName, workspaceId, standupId) {
    const params = {
      TableName: tableName,
      // For reserved keywords see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      Key: {
        pk: `workspace#${workspaceId}`,
        sk: `standup#${standupId}`
      },
      ProjectionExpression: 'id, createdBy, createdAt, updatedAt, #n, isPrivate'
    };
    return client.get(params).promise();
  },

  /**
   * Get all standup members.
   *
   * Returns a list of user IDs.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {String} standupId
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getMembers(client, tableName, standupId) {
    const params = {
      TableName: tableName,
      ExpressionAttributeValues: {
        ':pk': `standup#${standupId}`,
        ':sk_start': 'user#'
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ProjectionExpression: 'userId, userFullName'
    };
    return client.query(params).promise();
  }
};
