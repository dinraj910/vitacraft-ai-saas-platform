const { sendError, ERROR_CODES } = require('../utils/apiResponse');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Access denied. Required: ${roles.join(' or ')}`, ERROR_CODES.FORBIDDEN);
    }
    next();
  };
};

module.exports = { requireRole };