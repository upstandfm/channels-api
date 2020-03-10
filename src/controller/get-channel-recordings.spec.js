'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const userId = 'user|56ea6578fea85678ae4e4a65';
const channelId = 'EjezHSJY';
const recordingId = 'Zd3xp4E';

const fakeRecordings = [
  {
    id: recordingId,
    workspaceId,
    createdBy: userId,
    createdAt: '2020-03-11T11:25:42.287Z',
    updatedAt: '2020-03-11T11:25:42.287Z',
    name: 'Awesome update',
    transcodedFileKey: `audio/${workspaceId}/${channelId}/${recordingId}.mp3`,
    transcodingStatus: 'completed'
  }
];

const fakeChannelService = {};

const fakeRecordingService = {
  getAll: () =>
    Promise.resolve({
      Items: fakeRecordings,
      LastEvaluatedKey: undefined
    })
};

const options = {
  bodyParser,
  res: createResHandler()
};

const controller = createController(
  fakeChannelService,
  fakeRecordingService,
  options
);

const fakeEvent = {
  resource: '',
  path: `/channels/${channelId}/recordings`,
  httpMethod: 'GET',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  pathParameters: {
    channelId
  },
  stageVariables: {},
  requestContext: {},
  body: '',
  isBase64Encoded: false
};

const fakeContext = {
  captureError: () => undefined
};

const requiredScope = 'read:channel-recordings';
const defaultLimit = 20;

describe('controller.getChannelRecordings(event, context, requiredScope, defaultLimit)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.getChannelRecordings(
      fakeEvent,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing authorizer data',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing authorizer user ID', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {}
      }
    };
    const res = await controller.getChannelRecordings(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing user id',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing authorizer workspace ID', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId
        }
      }
    };
    const res = await controller.getChannelRecordings(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'Missing workspace id',
        details: 'Corrupt authorizer data. Contact "support@upstand.fm"'
      })
    });
  });

  it('returns error as JSON response with missing scope', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId
        }
      }
    };
    const res = await controller.getChannelRecordings(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:channel-recordings"'
      })
    });
  });

  it('returns error as JSON response with incorrect scope', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: 'read:tsjanol-recs'
        }
      }
    };
    const res = await controller.getChannelRecordings(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:channel-recordings"'
      })
    });
  });

  it('returns channel as JSON response', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      }
    };
    const res = await controller.getChannelRecordings(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 200,
      body: JSON.stringify({
        items: fakeRecordings,
        cursor: {
          next: null
        }
      })
    });
  });
});
