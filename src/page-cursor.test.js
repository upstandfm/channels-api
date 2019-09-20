'use strict';

const pageCursor = require('./page-cursor');

describe('decode(cursor)', () => {
  it('returns "undefined" without cursor', () => {
    const result = pageCursor.decode();
    expect(result).toBe(undefined);
  });

  it('throws when decoded cursor is invalid JSON', () => {
    const jsonStr = '{ key: }';
    const cursor = Buffer.from(jsonStr).toString('base64');
    expect(() => {
      pageCursor.decode(cursor);
    }).toThrow('Invalid cursor');
  });

  it('throws when decoded cursor misses pk', () => {
    const jsonStr = '{ }';
    const cursor = Buffer.from(jsonStr).toString('base64');
    expect(() => {
      pageCursor.decode(cursor);
    }).toThrow('Invalid cursor');
  });

  it('throws when decoded cursor misses sk', () => {
    const jsonStr = '{ "pk": "user#1234azxs" }';
    const cursor = Buffer.from(jsonStr).toString('base64');
    expect(() => {
      pageCursor.decode(cursor);
    }).toThrow('Invalid cursor');
  });

  it('returns primary key for valid cursor', () => {
    const primaryKey = { pk: 'user#1234azxs', sk: 'standup#0987qwer' };
    const jsonStr = JSON.stringify(primaryKey);
    const cursor = Buffer.from(jsonStr).toString('base64');
    const result = pageCursor.decode(cursor);
    expect(result).toEqual(primaryKey);
  });
});

describe('encode(lastEvaluatedKey)', () => {
  it('returns null without primary key', () => {
    const result = pageCursor.encode();
    expect(result).toBeNull();
  });

  it('returns Base64 encoded JSON string of the primary key', () => {
    const primaryKey = { pk: 'user#1234azxs', sk: 'standup#0987qwer' };
    const jsonStr = JSON.stringify(primaryKey);
    const want = Buffer.from(jsonStr).toString('base64');
    const result = pageCursor.encode(primaryKey);
    expect(result).toEqual(want);
  });
});
