const { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser } = require('../services/auth.service');
const { sendSuccess, sendError, ERROR_CODES } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// In production (Render + Vercel) cookies cross the Vercel proxy — keep SameSite lax
// so the httpOnly refresh-token cookie flows through the Vercel rewrite correctly.
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.cookie('refreshTokenId', result.tokenId, COOKIE_OPTIONS);
  return sendSuccess(res, 201, 'Account created! Welcome to VitaCraft AI.', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  }, { creditsGranted: 5 });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.cookie('refreshTokenId', result.tokenId, COOKIE_OPTIONS);
  return sendSuccess(res, 200, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokenId = req.cookies?.refreshTokenId;
  if (!refreshToken || !tokenId) return sendError(res, 401, 'Refresh token required', ERROR_CODES.REFRESH_TOKEN_INVALID);

  const result = await refreshAccessToken(refreshToken, tokenId);
  res.cookie('refreshTokenId', result.tokenId, COOKIE_OPTIONS);
  return sendSuccess(res, 200, 'Token refreshed', { accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user });
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.cookies?.refreshTokenId);
  res.clearCookie('refreshTokenId', { path: '/' });
  return sendSuccess(res, 200, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return sendSuccess(res, 200, 'Profile retrieved', user);
});

module.exports = { register, login, refresh, logout, getMe };