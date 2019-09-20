'use strict';

const shortid = require('shortid');

module.exports = {
  /**
   * Create a standup.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - DynamoDB table name
   * @param {Object} standupData
   *
   * @return {Promise} Resolves with DynamoDB data
   */
  create(client, tableName, standupData) {
    const id = shortid.generate();
    const now = Date.now();
    const insertData = {
      ...standupData,
      id,
      createdAt: now,
      updatedAt: now
    };

    const params = {
      TableName: tableName,
      Item: {
        pk: `standup#${id}`,
        sk: `standup#${id}`,
        ...insertData
      }
    };
    return client
      .put(params)
      .promise()
      .then(() => {
        // The "put" operation only supports ALL_OLD or NONE for return data
        // Therefore we have to return the inserted data ourselves, because
        // there are no "old" values when inserting a new item
        return insertData;
      });
  }
};
