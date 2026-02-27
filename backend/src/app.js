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

const app  = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
  app.listen(PORT, () => {
    logger.info(`🚀 VitaCraft AI Backend running on port ${PORT}`);
    logger.info(`🔗 http://localhost:${PORT}/health`);
  });
}

module.exports = app;