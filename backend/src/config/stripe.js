// src/config/stripe.js
// Stripe configuration — uses TEST keys only (no real charges)

const Stripe = require('stripe');
const logger = require('../utils/logger');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_...') {
  logger.warn('⚠️  Stripe secret key is not configured. Billing features will be disabled.');
  logger.warn('   Set STRIPE_SECRET_KEY in your .env file (use sk_test_ key from Stripe Dashboard).');
}

const stripe = STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_...'
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

// Plan → Stripe Price ID mapping (populated after seed or from .env)
// These are created in Stripe Dashboard or via seed script
const PLAN_CONFIG = {
  FREE: {
    credits: 5,
    priceUSD: 0,
  },
  PRO: {
    credits: 50,
    priceUSD: 9.99,
  },
  ENTERPRISE: {
    credits: 200,
    priceUSD: 29.99,
  },
};

module.exports = { stripe, PLAN_CONFIG };
