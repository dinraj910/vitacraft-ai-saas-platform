const { verifyToken } = require('../utils/generateTokens');
const { sendError, ERROR_CODES } = require('../utils/apiResponse');

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token required', ERROR_CODES.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);

  if (!decoded) {
    return sendError(res, 401, 'Invalid or expired access token', ERROR_CODES.TOKEN_INVALID);
  }

  req.user = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
  next();
};

module.exports = { verifyAccessToken };