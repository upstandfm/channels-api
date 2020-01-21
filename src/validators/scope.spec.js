'use strict';

const validateScope = require('./scope');

describe('validateScope(scope, requiredScope)', () => {
  it('throws with custom error when "scope" does not have "requiredScope"', () => {
    const scope = 'create:standup read:standups';
    const requiredScope = 'delete:standup';

    try {
      validateScope(scope, requiredScope);
    } catch (err) {
      expect(err).toHaveProperty('statusCode', 403);
      expect(err).toHaveProperty('message', 'Forbidden');
      expect(err).toHaveProperty(
        'details',
        `You need scope "${requiredScope}"`
      );
    }
  });
});
