'use strict';

const Joi = require('@hapi/joi');

const defaultJoi = Joi.defaults(_schema =>
  _schema.options({
    stripUnknown: true
  })
);

const _channelSchema = defaultJoi.object().keys({
  name: Joi.string()
    .required()
    .max(70)
});

function _validate(data, schema) {
  const { error: joiErr, value } = schema.validate(data);

  // For Joi "error" see:
  // https://github.com/hapijs/joi/blob/master/API.md#validationerror
  if (joiErr) {
    const err = new Error('Invalid request data');
    err.statusCode = 400;
    err.details = joiErr.details.map(e => e.message);
    throw err;
  }

  return value;
}

module.exports = {
  validateChannel(data = {}) {
    return _validate(data, _channelSchema);
  }
};
