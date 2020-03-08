'use strict';

module.exports = {
  /**
   * Get all standup updates.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {String} standupId
   * @param {Number} limit - How many items to get
   * @param {Object} exclusiveStartKey - DynamoDB primary key
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAll(client, tableName, workspaceId, standupId, limit, exclusiveStartKey) {
    const params = {
      TableName: tableName,

      // For reserved keywords see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
      ExpressionAttributeNames: {
        '#n': 'name'
      },

      ExpressionAttributeValues: {
        ':pk': `workspace#${workspaceId}#standup#${standupId}`,
        ':sk_start': `update#`
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ProjectionExpression:
        'id, createdBy, createdAt, updatedAt, #n, transcodingStatus, transcodedFileKey',

      // By default sort order is ascending
      // Setting "ScanIndexForward" to false, sorts descending
      ScanIndexForward: false,

      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey
    };

    return client.query(params).promise();
  }
};
