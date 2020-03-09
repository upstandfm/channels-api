'use strict';

const createRecordingService = require('./');

describe('Recording service', () => {
  describe('createRecordingService(db)', () => {
    it('throws without storage service', () => {
      expect(() => {
        createRecordingService();
      }).toThrowError(/^Provide a storage service$/);
    });

    it('creates service', () => {
      expect(() => {
        const fakeStorage = {};
        createRecordingService(fakeStorage);
      }).not.toThrowError();
    });
  });

  describe('recordingService.getAll(workspaceId, channelId, limit, exclusiveStartKey)', () => {
    it('calls storage service with workspace ID, channel ID, limit and exclusive start key', async () => {
      const fakeStorage = {
        getChannelRecordings: jest.fn(() => Promise.resolve())
      };
      const recordingService = createRecordingService(fakeStorage);
      const workspaceId = '1zxE3D2';
      const channelId = '3ed4f4z';
      const limit = 10;
      const exclusiveStartKey = {
        pk: `workspace#${workspaceId}#channel#${channelId}`,
        sk: 'recording#'
      };
      await recordingService.getAll(
        workspaceId,
        channelId,
        limit,
        exclusiveStartKey
      );

      // Check if we call the storage service
      expect(fakeStorage.getChannelRecordings.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct workspace ID
      const workspaceIdInput =
        fakeStorage.getChannelRecordings.mock.calls[0][0];
      expect(workspaceIdInput).toEqual(workspaceId);

      // Check if the storage service is called with correct channel ID
      const channelIdInput = fakeStorage.getChannelRecordings.mock.calls[0][1];
      expect(channelIdInput).toEqual(channelId);

      // Check if the storage service is called with correct limit
      const limitInput = fakeStorage.getChannelRecordings.mock.calls[0][2];
      expect(limitInput).toEqual(limit);

      // Check if the storage service is called with correct exclusive start key
      const keyInput = fakeStorage.getChannelRecordings.mock.calls[0][3];
      expect(keyInput).toEqual(exclusiveStartKey);
    });
  });
});
