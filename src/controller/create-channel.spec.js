'use strict';

const bodyParser = require('@mooncake-dev/lambda-body-parser');
const createResHandler = require('@mooncake-dev/lambda-res-handler');
const createController = require('.');

const workspaceId = 'a2xpQr34';
const userId = 'user|56ea6578fea85678ae4e4a65';

const fakeChannel = {
  id: 'EjezHSJY',
  workspaceId,
  createdBy: userId,
  createdAt: '2020-03-11T11:25:42.287Z',
  updatedAt: '2020-03-11T11:25:42.287Z',
  isPrivate: true,
  name: 'Daily standup'
};

const fakeChannelService = {
  create: () => Promise.resolve(fakeChannel)
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
  httpMethod: 'POST',
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

const requiredScope = 'create:channel';

describe('controller.createChannel(event, context, requiredScope)', () => {
  it('returns error as JSON response with missing authorizer data', async () => {
    const res = await controller.createChannel(
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
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
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
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
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
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "create:channel"'
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
          scope: 'create:tsjanol'
        }
      }
    };
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 403,
      body: JSON.stringify({
        message: 'Forbidden',
        details: 'You need scope "create:channel"'
      })
    });
  });

  it('returns error as JSON response with missing name request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({})
    };
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"name" is required']
      })
    });
  });

  it('returns error as JSON response with invalid name in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        name: 1
      })
    };
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: ['"name" must be a string']
      })
    });
  });

  it('returns error as JSON response with too long name in request body', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        name:
          'Hello this is a very long piece of text to see if we validate for too long strings'
      })
    };
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request data',
        details: [
          '"name" length must be less than or equal to 70 characters long'
        ]
      })
    });
  });

  it('returns created channel as JSON response', async () => {
    const event = {
      ...fakeEvent,
      requestContext: {
        authorizer: {
          userId,
          workspaceId,
          scope: requiredScope
        }
      },
      body: JSON.stringify({
        name: fakeChannel.name
      })
    };
    const res = await controller.createChannel(
      event,
      fakeContext,
      requiredScope
    );

    expect(res).toEqual({
      headers: {},
      statusCode: 201,
      body: JSON.stringify(fakeChannel)
    });
  });
});
