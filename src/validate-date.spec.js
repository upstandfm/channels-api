'use strict';

const validateDate = require('./validate-date');

const errMsg = 'Invalid date format';
const errDetails = 'The "date" must have format "DD-MM-YYYY"';
const errStatusCode = 400;

describe('validateDate(date)', () => {
  it('throws without date', () => {
    try {
      validateDate();
    } catch (err) {
      expect(err).toHaveProperty('message', errMsg);
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('throws with invalid date', () => {
    try {
      validateDate({});
    } catch (err) {
      expect(err).toHaveProperty('message', errMsg);
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('throws with invalid format', () => {
    try {
      validateDate('2019-10-18');
    } catch (err) {
      expect(err).toHaveProperty('message', errMsg);
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('does not throw with valid format', () => {
    try {
      validateDate('18-10-2019');
    } catch (err) {
      expect(err).toBe(null);
    }
  });
});
