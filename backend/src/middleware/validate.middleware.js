const { sendError, ERROR_CODES } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    return sendError(res, 400, 'Validation failed. Please check your input.', ERROR_CODES.VALIDATION_ERROR, errors);
  }

  req.body = result.data;
  next();
};

module.exports = { validate };