// src/api/v1/routes/billing.routes.js
const { Router } = require('express');
const {
  createCheckoutHandler,
  createPortalHandler,
  webhookHandler,
  getSubscriptionHandler,
  getPlansHandler,
} = require('../../../controllers/billing.controller');
const { verifyAccessToken } = require('../../../middleware/auth.middleware');

const router = Router();

// Public
router.get('/plans', getPlansHandler);

// Webhook — public (Stripe calls this), raw body handled by app-level middleware
router.post('/webhook', webhookHandler);

// Protected
router.post('/create-checkout-session', verifyAccessToken, createCheckoutHandler);
router.post('/create-portal-session', verifyAccessToken, createPortalHandler);
router.get('/subscription', verifyAccessToken, getSubscriptionHandler);

module.exports = router;
