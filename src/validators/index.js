'use strict';

const validateAuthorizerData = require('./authorizer');
const validateScope = require('./scope');

module.exports = {
  validateAuthorizerData,
  validateScope
};
