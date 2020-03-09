'use strict';

const createStorageService = require('./');

describe('Storage service', () => {
  describe('createStorageService(client, tableName)', () => {
    it('throws without a client', () => {
      expect(() => {
        createStorageService();
      }).toThrowError(/^Provide a storage client$/);
    });

    it('throws without a table name', () => {
      expect(() => {
        const fakeClient = {};
        createStorageService(fakeClient);
      }).toThrowError(/^Provide a table name$/);
    });

    it('creates the service', () => {
      expect(() => {
        const fakeClient = {};
        const fakeTable = 'Fake';
        createStorageService(fakeClient, fakeTable);
      }).not.toThrowError();
    });
  });
});
