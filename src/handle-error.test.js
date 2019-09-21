'use strict';

const handleError = require('./handle-error');

describe('handleError(context, err, sendRes)', () => {
  it('calls "context.captureError" and "sendRes.json"', () => {
    const context = {
      captureError: jest.fn()
    };
    const err = {};
    const sendRes = {
      json: jest.fn()
    };
    handleError(context, err, sendRes);
    expect(context.captureError).toHaveBeenCalledTimes(1);
    expect(sendRes.json).toHaveBeenCalledTimes(1);
  });

  it('sends error response with status code, "message" and "details"', () => {
    const context = {};
    const err = {
      statusCode: 400,
      message: 'Bad Request',
      details: 'Invalid request data'
    };
    const sendRes = {
      json: jest.fn()
    };
    handleError(context, err, sendRes);
    expect(sendRes.json).toHaveBeenCalledWith(err.statusCode, {
      message: err.message,
      details: err.details
    });
  });
});
