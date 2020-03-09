'use strict';

const createChannelService = require('./');

describe('Channel service', () => {
  describe('createChannelService(db)', () => {
    it('throws without storage service', () => {
      expect(() => {
        createChannelService();
      }).toThrowError(/^Provide a storage service$/);
    });

    it('creates workspace service', () => {
      expect(() => {
        const fakeStorage = {};
        createChannelService(fakeStorage);
      }).not.toThrowError();
    });
  });

  describe('channelService.create(workspaceId, userId, data)', () => {
    it('calls storage service with workspace ID and channel data', async () => {
      const fakeStorage = {
        insertChannel: jest.fn(() => Promise.resolve())
      };
      const channelService = createChannelService(fakeStorage);

      const workspaceId = '2WqPx7dl';
      const userId = 'auth|56ef6438fe46e3af4dd483e1';
      const data = {
        name: 'Fake channel'
      };

      await channelService.create(workspaceId, userId, data);

      // Check if we call the storage service
      expect(fakeStorage.insertChannel.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct workspace ID
      const workspaceIdInput = fakeStorage.insertChannel.mock.calls[0][0];
      expect(workspaceIdInput).toEqual(workspaceId);

      // Check if the storage service is called with correct item data
      const itemInput = fakeStorage.insertChannel.mock.calls[0][1];
      expect(itemInput.id).toExist;
      expect(itemInput.createdBy).toEqual(userId);
      expect(itemInput.createdAt).toExist;
      expect(itemInput.updatedAt).toExist;
      expect(itemInput.isPrivate).toEqual(true);
      expect(itemInput.name).toEqual(data.name);
    });
  });

  describe('channelService.getAll(workspaceId, limit, exclusiveStartKey)', () => {
    it('calls storage service with workspace ID', async () => {
      const fakeStorage = {
        getWorkspaceChannels: jest.fn(() => Promise.resolve())
      };
      const channelService = createChannelService(fakeStorage);
      const workspaceId = '1zxE3D2';
      const limit = 10;
      const exclusiveStartKey = {
        pk: `workspace#${workspaceId}`,
        sk: 'channel#c3dx045'
      };
      await channelService.getAll(workspaceId, limit, exclusiveStartKey);

      // Check if we call the storage service
      expect(fakeStorage.getWorkspaceChannels.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct workspace ID
      const workspaceIdInput =
        fakeStorage.getWorkspaceChannels.mock.calls[0][0];
      expect(workspaceIdInput).toEqual(workspaceId);

      // Check if the storage service is called with correct limit
      const limitInput = fakeStorage.getWorkspaceChannels.mock.calls[0][1];
      expect(limitInput).toEqual(limit);

      // Check if the storage service is called with correct exclusive start key
      const keyInput = fakeStorage.getWorkspaceChannels.mock.calls[0][2];
      expect(keyInput).toEqual(exclusiveStartKey);
    });
  });

  describe('channelService.get(workspaceId, channelId)', () => {
    it('calls storage service with workspace ID', async () => {
      const fakeStorage = {
        getChannel: jest.fn(() => Promise.resolve())
      };
      const channelService = createChannelService(fakeStorage);
      const workspaceId = '1zxE3D2';
      const channelId = 'c3dx045';
      await channelService.get(workspaceId, channelId);

      // Check if we call the storage service
      expect(fakeStorage.getChannel.mock.calls.length).toEqual(1);

      // Check if the storage service is called with correct workspace ID
      const workspaceIdInput = fakeStorage.getChannel.mock.calls[0][0];
      expect(workspaceIdInput).toEqual(workspaceId);

      // Check if the storage service is called with correct channel ID
      const channelIdInput = fakeStorage.getChannel.mock.calls[0][1];
      expect(channelIdInput).toEqual(channelId);
    });
  });
});
