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
  }
};
