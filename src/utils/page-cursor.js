'use strict';

module.exports = {
  /**
   * Decode a "page cursor" to get a primary key.
   *
   * @param {String} cursor - Base64 encoded cursor
   *
   * @return {undefined|Object} ExclusiveStartKey (DynamoDB primary key)
   */
  decode(cursor) {
    if (!cursor) {
      return;
    }

    let key;

    try {
      const jsonStr = Buffer.from(cursor, 'base64').toString('ascii');
      key = JSON.parse(jsonStr);
    } catch (err) {
      throw new Error('Malformed cursor');
    }

    if (!key.pk || !key.sk) {
      throw new Error('Invalid cursor');
    }

    return key;
  },

  /**
   * Encode a primary key to create a "page cursor".
   *
   * @param {Object} lastEvaluatedKey - DynamoDB primary key
   *
   * @return {null|String} Cursor (Base64 encoded)
   */
  encode(lastEvaluatedKey) {
    if (!lastEvaluatedKey) {
      return null;
    }

    const str = JSON.stringify(lastEvaluatedKey);
    const cursor = Buffer.from(str).toString('base64');
    return cursor;
  }
};
