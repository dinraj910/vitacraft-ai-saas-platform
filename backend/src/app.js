require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const cookieParser = require('cookie-parser');
const morgan      = require('morgan');

const logger           = require('./utils/logger');
const { sendSuccess }  = require('./utils/apiResponse');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');
const { apiLimiter }   = require('./middleware/rateLimiter.middleware');
const v1Router         = require('./api/v1/index');

require('./config/db'); // connect on startup

// Log which LLM providers are configured on startup
const { getEnabledProviders, PROVIDERS } = require('./config/llm');
setTimeout(() => {
  const enabled = getEnabledProviders();
  if (enabled.length === 0) {
    logger.warn('⚠️  No LLM providers configured! Add API keys to .env');
  } else {
    logger.info(`✅ LLM providers ready: ${enabled.map((k) => PROVIDERS[k].name).join(' → ')}`);
  }
}, 1000);

const app  = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook needs the raw body for signature verification — must come BEFORE express.json()
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limit all API routes
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'VitaCraft AI API is healthy', {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use('/api/v1', v1Router);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 VitaCraft AI Backend running on port ${PORT}`);
    logger.info(`🔗 http://localhost:${PORT}/health`);
  });
  
  // Timeout for AI generation requests (cloud APIs are fast, 60s is plenty)
  server.timeout = 60000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 70000;
}

module.exports = app;