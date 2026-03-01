// src/controllers/billing.controller.js
// Stripe billing endpoints — checkout, portal, webhook, subscription info

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  getSubscriptionDetails,
  getPlans,
} = require('../services/billing.service');
const { stripe } = require('../config/stripe');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/billing/create-checkout-session
// ─────────────────────────────────────────────────────────────────────────────
const createCheckoutHandler = asyncHandler(async (req, res) => {
  const { planName } = req.body;

  if (!planName || !['PRO', 'ENTERPRISE'].includes(planName)) {
    return sendError(res, 400, 'Invalid plan. Choose PRO or ENTERPRISE.', 'INVALID_PLAN');
  }

  const user = { id: req.user.id, email: req.user.email, name: req.user.name };
  const session = await createCheckoutSession(user, planName);

  return sendSuccess(res, 200, 'Checkout session created', session);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/billing/create-portal-session
// ─────────────────────────────────────────────────────────────────────────────
const createPortalHandler = asyncHandler(async (req, res) => {
  const user = { id: req.user.id, email: req.user.email, name: req.user.name };
  const session = await createPortalSession(user);
  return sendSuccess(res, 200, 'Portal session created', session);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/billing/webhook  (NO auth — Stripe calls this directly)
// ─────────────────────────────────────────────────────────────────────────────
const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  let event;
  try {
    // req.body must be the raw buffer (not parsed JSON)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    await handleWebhookEvent(event);
  } catch (err) {
    logger.error(`Webhook handler error: ${err.message}`);
    // Still return 200 so Stripe doesn't retry
  }

  res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/billing/subscription
// ─────────────────────────────────────────────────────────────────────────────
const getSubscriptionHandler = asyncHandler(async (req, res) => {
  const details = await getSubscriptionDetails(req.user.id);
  return sendSuccess(res, 200, 'Subscription details retrieved', details);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/billing/plans
// ─────────────────────────────────────────────────────────────────────────────
const getPlansHandler = asyncHandler(async (req, res) => {
  const plans = await getPlans();
  return sendSuccess(res, 200, 'Plans retrieved', plans);
});

module.exports = {
  createCheckoutHandler,
  createPortalHandler,
  webhookHandler,
  getSubscriptionHandler,
  getPlansHandler,
};
