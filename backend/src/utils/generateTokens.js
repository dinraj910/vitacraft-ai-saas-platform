const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', issuer: 'vitacraft-ai' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', issuer: 'vitacraft-ai' }
  );
};

const generateSecureToken = () => crypto.randomBytes(40).toString('hex');

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret, { issuer: 'vitacraft-ai' });
  } catch {
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, generateSecureToken, verifyToken };