'use strict';

const shortid = require('shortid');

module.exports = {
  /**
   * Create a standup.
   *
   * This operation uses a transaction to also add a "user entry" item for the
   * created standup, in order to associate the created standup with the user
   * who created it.
   * This allows us to fetch all users for a standup, and (in combination with
   * an inverted GSI) to fetch all standups for a user.
   *
   * For more info on DynamoDB transactions see:
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactWrite-property
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {Object} standupData
   * @param {String} userId
   *
   * @return {Promise} Resolves with DynamoDB data
   */
  create(client, tableName, standupData, userId) {
    const id = shortid.generate();
    const now = Date.now();
    const insertData = {
      ...standupData,
      standupId: id,
      createdAt: now,
      updatedAt: now
    };

    const params = {
      TransactItems: [
        {
          Put: {
            TableName: tableName,
            Item: {
              pk: `standup#${id}`,
              sk: `standup#${id}`,
              ...insertData
            }
          }
        },
        {
          Put: {
            TableName: tableName,
            Item: {
              pk: `standup#${id}`,
              sk: `user#${userId}`,
              standupId: id,
              standupName: insertData.standupName,
              userId,

              // TODO: add the users full name
              userFullName: ''
            }
          }
        }
      ]
    };
    return client
      .transactWrite(params)
      .promise()
      .then(() => {
        // The "transactWrite" operation does not return the written data,
        // therefore we have to return the inserted data ourselves
        return insertData;
      });
  },

  /**
   * Get all standups for a user.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {String} indexName - DynamoDB index name
   * @param {String} userId
   * @param {Number} limit - How many items to get
   * @param {Object} exclusiveStartKey - DynamoDB primary key
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAllForUser(
    client,
    tableName,
    indexName,
    userId,
    limit,
    exclusiveStartKey
  ) {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      ExpressionAttributeValues: {
        ':sk': `user#${userId}`, // this is now the partition key
        ':pk_start': 'standup#' // this is now the sort key
      },
      KeyConditionExpression: 'sk = :sk and begins_with(pk, :pk_start)',
      ProjectionExpression: 'standupId, standupName',
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey
    };
    return client.query(params).promise();
  },

  /**
   * Get a single standup for a user.
   *
   * This operation uses a transaction to also check if the user is associated
   * with the standup.
   *
   * For more info on DynamoDB transactions see:
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactGet-property
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {String} standupId
   * @param {String} userId
   *
   * @return {Promise} Resolves with DynamoDB data
   */
  getForUser(client, tableName, standupId, userId) {
    const params = {
      TransactItems: [
        {
          Get: {
            TableName: tableName,
            Key: {
              pk: `standup#${standupId}`,
              sk: `user#${userId}`
            }
          }
        },
        {
          Get: {
            TableName: tableName,
            Key: {
              pk: `standup#${standupId}`,
              sk: `standup#${standupId}`
            },
            ProjectionExpression: 'standupId, standupName, createdAt, updatedAt'
          }
        }
      ]
    };
    return client
      .transactGet(params)
      .promise()
      .then(data => {
        const [userItem, standupItem] = data.Responses;

        if (!userItem.Item) {
          const err = new Error('Not Found');
          err.statusCode = 404;
          err.details = 'You might not be a member of this standup.';
          throw err;
        }

        return standupItem.Item;
      });
  },

  /**
   * Check if a user is a member of a standup.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {String} standupId
   * @param {String} userId
   *
   * @return {Promise} Resolves with Boolean
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
   */
  userIsMember(client, tableName, standupId, userId) {
    const params = {
      TableName: tableName,
      Key: {
        pk: `standup#${standupId}`,
        sk: `user#${userId}`
      }
    };

    return client
      .get(params)
      .promise()
      .then(data => Boolean(data.Item));
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
