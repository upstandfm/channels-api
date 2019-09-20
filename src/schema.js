'use strict';

const Joi = require('joi');

const defaultJoi = Joi.defaults(_schema =>
  _schema.options({
    stripUnknown: true
  })
);

const _standupSchema = defaultJoi.object().keys({
  name: Joi.string().required()
});

function _validate(data, schema) {
  const { error, value } = Joi.validate(data, schema);
  if (error) {
    const err = new Error('Invalid request data');
    err.statusCode = 400;
    err.details = error.details.map(e => e.message);
    throw err;
  }

  return value;
}

module.exports = {
  validateStandup(data = {}) {
    return _validate(data, _standupSchema);
  }
};
