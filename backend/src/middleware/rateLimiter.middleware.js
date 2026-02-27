const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

const handler = (req, res) => sendError(res, 429, 'Too many requests. Please slow down.', 'RATE_LIMIT_EXCEEDED');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, handler, standardHeaders: true, legacyHeaders: false });
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, handler, standardHeaders: true, legacyHeaders: false });
const aiLimiter   = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, handler, standardHeaders: true, legacyHeaders: false });

module.exports = { authLimiter, apiLimiter, aiLimiter };