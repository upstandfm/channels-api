'use strict';

module.exports = {
  /**
   * Get standup updates for a date.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {Object} standupId
   * @param {String} dateKey - Date with format "(D)D-(M)M-YYYY"
   *
   * @return {Promise} Resolves with DynamoDB data
   *
   * For SDK documentation see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
   */
  getForDate(client, tableName, standupId, dateKey) {
    const params = {
      TableName: tableName,
      ExpressionAttributeNames: {
        '#s': 'status'
      },
      ExpressionAttributeValues: {
        ':pk': `standup#${standupId}`,
        ':sk_start': `update#${dateKey}#user`
      },
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk_start)',
      ProjectionExpression:
        'recordingId, standupId, userId, filename, #s, transcodedFileKey, createdAt, updatedAt'
    };

    return client.query(params).promise();
  }
};
