const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && { data }),
    ...(Object.keys(meta).length > 0 && { meta }),
  });
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      statusCode,
      ...(errors && { details: errors }),
    },
  });
};

const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

module.exports = { sendSuccess, sendError, ERROR_CODES };