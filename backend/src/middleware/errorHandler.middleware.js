const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });

  if (err.code === 'P2002') return sendError(res, 409, 'A record with this value already exists.', 'CONFLICT');
  if (err.code === 'P2025') return sendError(res, 404, 'Record not found.', 'NOT_FOUND');
  if (err.name === 'JsonWebTokenError') return sendError(res, 401, 'Invalid token.', 'TOKEN_INVALID');
  if (err.name === 'TokenExpiredError') return sendError(res, 401, 'Token has expired.', 'TOKEN_EXPIRED');
  if (err.code === 'INSUFFICIENT_CREDITS') return sendError(res, 402, err.message, 'INSUFFICIENT_CREDITS');
  if (err.status || err.statusCode) return sendError(res, err.status || err.statusCode, err.message, err.code || 'APP_ERROR');

  const message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message;
  return sendError(res, 500, message, 'INTERNAL_ERROR');
};

const notFoundHandler = (req, res) =>
  sendError(res, 404, `Route ${req.method} ${req.url} not found`, 'ROUTE_NOT_FOUND');

module.exports = { errorHandler, notFoundHandler };