'use strict';

const createController = require('.');

describe('Controller', () => {
  describe('createController(channel, recording, options)', () => {
    it('throws without a channel service', () => {
      expect(() => {
        createController();
      }).toThrowError(/^Provide a channel service$/);
    });

    it('throws without a recording service', () => {
      expect(() => {
        const fakeChannelService = {};
        createController(fakeChannelService);
      }).toThrowError(/^Provide a recording service$/);
    });

    it('throws without JSON body parser', () => {
      expect(() => {
        const fakeChannelService = {};
        const fakeRecordingService = {};
        const options = {
          bodyParser: {
            json: undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeChannelService, fakeRecordingService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws when JSON body parser is not a function', () => {
      expect(() => {
        const fakeChannelService = {};
        const fakeRecordingService = {};
        const options = {
          bodyParser: {
            json: 1
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeChannelService, fakeRecordingService, options);
      }).toThrowError(/^Provide a body parser function to parse JSON strings$/);
    });

    it('throws without JSON response handler', () => {
      expect(() => {
        const fakeChannelService = {};
        const fakeRecordingService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: undefined
          }
        };
        createController(fakeChannelService, fakeRecordingService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('throws when JSON response handler is not a function', () => {
      expect(() => {
        const fakeChannelService = {};
        const fakeRecordingService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: 'hello'
          }
        };
        createController(fakeChannelService, fakeRecordingService, options);
      }).toThrowError(/^Provide a function to send JSON responses$/);
    });

    it('creates controller', () => {
      expect(() => {
        const fakeChannelService = {};
        const fakeRecordingService = {};
        const options = {
          bodyParser: {
            json: () => undefined
          },
          res: {
            json: () => undefined
          }
        };
        createController(fakeChannelService, fakeRecordingService, options);
      }).not.toThrowError();
    });
  });
});
