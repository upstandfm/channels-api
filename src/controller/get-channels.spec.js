'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const userId = 'user|56ea6578fea85678ae4e4a65';

const fakeChannels = [
  {
    id: 'EjezHSJY',
    workspaceId,
    createdBy: userId,
    createdAt: '2020-03-11T11:25:42.287Z',
    updatedAt: '2020-03-11T11:25:42.287Z',
    isPrivate: true,
    name: 'Daily standup'
  }
];

const fakeChannelService = {
  getAll: () =>
    Promise.resolve({
      Items: fakeChannels,
      LastEvaluatedKey: undefined
    })
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
  path: '/channels',
  httpMethod: 'GET',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  pathParameters: {},
  stageVariables: {},
  requestContext: {},
  body: '',
  isBase64Encoded: false
};

const fakeContext = {
  captureError: () => undefined
};

const requiredScope = 'read:channels';
const defaultLimit = 20;

describe('controller.getChannels(event, context, requiredScope, defaultLimit)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.getChannels(
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
    const res = await controller.getChannels(
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
    const res = await controller.getChannels(
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
    const res = await controller.getChannels(
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
        details: 'You need scope "read:channels"'
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
          scope: 'read:tsjanols'
        }
      }
    };
    const res = await controller.getChannels(
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
        details: 'You need scope "read:channels"'
      })
    });
  });

  it('returns channels as JSON response', async () => {
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
    const res = await controller.getChannels(
      event,
      fakeContext,
      requiredScope,
      defaultLimit
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 200,
      body: JSON.stringify({
        items: fakeChannels,
        cursor: {
          next: null
        }
      })
    });
  });
});
