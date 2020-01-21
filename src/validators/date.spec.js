'use strict';

const validateDate = require('./date');

const errMsg = 'Invalid Date Format';
const errDetails =
  'The valid date format is "YYYY-MM-DD", for example "18-10-2019" or "01-01-2020"';
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
      validateDate('12-01-2019');
    } catch (err) {
      expect(err).toHaveProperty('message', errMsg);
      expect(err).toHaveProperty('details', errDetails);
      expect(err).toHaveProperty('statusCode', errStatusCode);
    }
  });

  it('does not throw with valid format', () => {
    try {
      validateDate('2020-01-21');
    } catch (err) {
      expect(err).toBe(null);
    }
  });
});
