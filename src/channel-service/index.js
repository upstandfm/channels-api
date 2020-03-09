'use strict';

const shortid = require('shortid');

/**
 * Create channel service.
 *
 * @param {Object} db - Storage service
 *
 * @return {Object} Channel service interface
 */
module.exports = function createWorkspaceService(db) {
  if (!db) {
    throw new Error('Provide a storage service');
  }

  return {
    /**
     * Create a channel.
     *
     * @param {String} workspaceId
     * @param {String} userId
     * @param {Object} data
     *
     * @param {String} data.name
     *
     * @return {Promise} Resolves with created channel
     */
    create(workspaceId, userId, data) {
      const now = new Date().toISOString();
      const item = {
        ...data,
        id: shortid.generate(),
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        isPrivate: true
      };
      return db.insertChannel(workspaceId, item);
    },

    /**
     * Get all channels.
     *
     * @param {String} workspaceId
     * @param {Number} limit - How many items to get
     * @param {Object} exclusiveStartKey - DynamoDB primary key
     *
     * @return {Promise} Resolves with channels
     */
    getAll(workspaceId, limit, exclusiveStartKey) {
      return db.getWorkspaceChannels(workspaceId, limit, exclusiveStartKey);
    },

    /**
     * Get a channel.
     *
     * @param {String} workspaceId
     * @param {String} channelId
     *
     * @return {Promise} Resolves with channel
     */
    get(workspaceId, channelId) {
      return db.getChannel(workspaceId, channelId);
    }
  };
};
