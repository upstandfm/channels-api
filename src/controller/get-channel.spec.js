'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const userId = 'user|56ea6578fea85678ae4e4a65';
const channelId = 'EjezHSJY';

const fakeChannel = {
  id: channelId,
  workspaceId,
  createdBy: userId,
  createdAt: '2020-03-11T11:25:42.287Z',
  updatedAt: '2020-03-11T11:25:42.287Z',
  isPrivate: true,
  name: 'Daily standup'
};
const fakeChannelService = {
  get: () => Promise.resolve(fakeChannel)
};

const fakeRecordingService = {};

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
  path: `/channels/${channelId}`,
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

const requiredScope = 'read:channel';

describe('controller.getChannel(event, context, requiredScope)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.getChannel(
      fakeEvent,
      fakeContext,
      requiredScope
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
    const res = await controller.getChannel(event, fakeContext, requiredScope);

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
    const res = await controller.getChannel(event, fakeContext, requiredScope);

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
    const res = await controller.getChannel(event, fakeContext, requiredScope);

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:channel"'
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
          scope: 'read:tsjanol'
        }
      }
    };
    const res = await controller.getChannel(event, fakeContext, requiredScope);

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "read:channel"'
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
    const res = await controller.getChannel(event, fakeContext, requiredScope);

    expect(res).toEqual({
      headers: {},
      statusCode: 200,
      body: JSON.stringify(fakeChannel)
    });
  });
});
