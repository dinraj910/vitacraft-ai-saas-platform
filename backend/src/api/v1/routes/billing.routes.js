// src/api/v1/routes/billing.routes.js
const { Router } = require('express');
const {
  createCheckoutHandler,
  createPortalHandler,
  webhookHandler,
  getSubscriptionHandler,
  getPlansHandler,
} = require('../../../controllers/billing.controller');
const { authenticate } = require('../../../middleware/auth.middleware');

const router = Router();

// Public
router.get('/plans', getPlansHandler);

// Webhook — public (Stripe calls this), raw body handled by app-level middleware
router.post('/webhook', webhookHandler);

// Protected
router.post('/create-checkout-session', authenticate, createCheckoutHandler);
router.post('/create-portal-session', authenticate, createPortalHandler);
router.get('/subscription', authenticate, getSubscriptionHandler);

module.exports = router;
