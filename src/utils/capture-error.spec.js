'use strict';

const captureError = require('./capture-error');

describe('captureError(context, err)', () => {
  it('calls context.captureError(err)', () => {
    const fakeContext = {
      captureError: jest.fn()
    };
    const err = new Error('Kaboom');

    captureError(fakeContext, err);

    expect(fakeContext.captureError.mock.calls.length).toBe(1);
    // Check if capureError is called with error
    expect(fakeContext.captureError.mock.calls[0][0]).toEqual(err);
  });
});
