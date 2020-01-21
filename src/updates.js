'use strict';

module.exports = {
  /**
   * Get all standup updates for a date.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {String} standupId
   * @param {String} date - Date with format "YYYY-MM-DD"
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAllForDate(client, tableName, workspaceId, standupId, date) {
    const params = {
      TableName: tableName,
      // For reserved keywords see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':pk': `workspace#${workspaceId}#standup#${standupId}`,
        ':sk_start': `update#${date}#user`
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ProjectionExpression:
        'id, createdBy, createdAt, updatedAt, #n, transcodingStatus, transcodedFileKey'
    };

    return client.query(params).promise();
  }
};
