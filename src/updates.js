'use strict';

module.exports = {
  /**
   * Get all standup updates for a date.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName
   * @param {String} workspaceId
   * @param {String} standupId
   * @param {String} dateKey - Date with format "(D)D-(M)M-YYYY"
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getAllForDate(client, tableName, workspaceId, standupId, dateKey) {
    const params = {
      TableName: tableName,
      // For reserved keywords see:
      // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
      ExpressionAttributeNames: {
        '#n': 'name'
      },
      ExpressionAttributeValues: {
        ':pk': `workspace#${workspaceId}#standup#${standupId}`,
        ':sk_start': `update#${dateKey}#user`
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ProjectionExpression:
        'id, createdBy, createdAt, updatedAt, #n, transcodingStatus, transcodedFileKey'
    };

    return client.query(params).promise();
  }
};
