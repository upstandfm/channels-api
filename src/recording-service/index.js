'use strict';

/**
 * Create recording service.
 *
 * @param {Object} db - Storage service
 *
 * @return {Object} Recording service interface
 */
module.exports = function createRecordingService(db) {
  if (!db) {
    throw new Error('Provide a storage service');
  }

  return {
    /**
     * Get all channel recordings.
     *
     * @param {String} workspaceId
     * @param {String} channelId
     * @param {Number} limit - How many items to get
     * @param {Object} exclusiveStartKey - DynamoDB primary key
     *
     * @return {Promise} Resolves with channel recordings list
     */
    getAll(workspaceId, channelId, limit, exclusiveStartKey) {
      return db.getChannelRecordings(
        workspaceId,
        channelId,
        limit,
        exclusiveStartKey
      );
    }
  };
};
