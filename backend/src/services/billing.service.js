// src/services/billing.service.js
// Stripe Checkout + subscription management (TEST MODE only)

const prisma   = require('../config/db');
const { stripe } = require('../config/stripe');
const { addCredits } = require('./credit.service');
const logger   = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Create or retrieve a Stripe customer for the user
// ─────────────────────────────────────────────────────────────────────────────
const getOrCreateStripeCustomer = async (user) => {
  // Check if user already has a Stripe customer ID in their subscription
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });

  if (sub?.stripeCustomerId) {
    return sub.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });

  // Store customer ID
  if (sub) {
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  logger.info(`Stripe customer created: ${customer.id} for user ${user.id}`);
  return customer.id;
};

// ─────────────────────────────────────────────────────────────────────────────
// Create a Stripe Checkout Session for subscription upgrade
// ─────────────────────────────────────────────────────────────────────────────
const createCheckoutSession = async (user, planName) => {
  if (!stripe) {
    const err = new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    err.status = 503; err.code = 'STRIPE_NOT_CONFIGURED'; throw err;
  }

  const plan = await prisma.plan.findUnique({ where: { name: planName } });
  if (!plan) {
    const err = new Error(`Plan "${planName}" not found`);
    err.status = 404; throw err;
  }

  if (plan.priceUSD === 0) {
    const err = new Error('Cannot checkout for the free plan');
    err.status = 400; throw err;
  }

  const customerId = await getOrCreateStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success&plan=${planName}`,
    cancel_url:  `${process.env.FRONTEND_URL}/dashboard?checkout=cancelled`,
    metadata: {
      userId: user.id,
      planName: planName,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        planName: planName,
      },
    },
  });

  logger.info(`Checkout session created: ${session.id} for plan ${planName}`);
  return { sessionId: session.id, url: session.url };
};

// ─────────────────────────────────────────────────────────────────────────────
// Create a Stripe Billing Portal session (manage subscription)
// ─────────────────────────────────────────────────────────────────────────────
const createPortalSession = async (user) => {
  if (!stripe) {
    const err = new Error('Stripe is not configured');
    err.status = 503; err.code = 'STRIPE_NOT_CONFIGURED'; throw err;
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeCustomerId) {
    const err = new Error('No billing account found. Please subscribe first.');
    err.status = 400; throw err;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  return { url: session.url };
};

// ─────────────────────────────────────────────────────────────────────────────
// Handle Stripe webhook events
// ─────────────────────────────────────────────────────────────────────────────
const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object;
      await handleInvoicePaid(invoice);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }
};

// ── Webhook handlers ──────────────────────────────────────────────────

const handleCheckoutCompleted = async (session) => {
  const userId   = session.metadata?.userId;
  const planName = session.metadata?.planName;
  if (!userId || !planName) {
    logger.warn('Checkout session missing metadata', { sessionId: session.id });
    return;
  }

  const plan = await prisma.plan.findUnique({ where: { name: planName } });
  if (!plan) return;

  const stripeSubId = session.subscription;

  // Update user subscription
  await prisma.subscription.update({
    where: { userId },
    data: {
      planId: plan.id,
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId: session.customer,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ~30 days
    },
  });

  // Grant credits for the new plan
  await addCredits(userId, plan.monthlyCredits, 'SUBSCRIPTION_UPGRADE');

  logger.info(`✅ User ${userId} upgraded to ${planName} — ${plan.monthlyCredits} credits granted`);
};

const handleInvoicePaid = async (invoice) => {
  const stripeSubId = invoice.subscription;
  if (!stripeSubId) return;

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    include: { plan: true },
  });
  if (!sub) return;

  // Only add credits for recurring payments (not the initial one)
  if (invoice.billing_reason === 'subscription_cycle') {
    await addCredits(sub.userId, sub.plan.monthlyCredits, 'SUBSCRIPTION_RENEWAL');
    logger.info(`🔄 Renewal credits granted: ${sub.plan.monthlyCredits} for user ${sub.userId}`);
  }

  // Update period dates
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(invoice.period_start * 1000),
      currentPeriodEnd:   new Date(invoice.period_end * 1000),
    },
  });
};

const handleSubscriptionUpdated = async (subscription) => {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!sub) return;

  const statusMap = {
    active:   'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    unpaid:   'INACTIVE',
  };

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: statusMap[subscription.status] || 'INACTIVE',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  logger.info(`Subscription updated: ${sub.id} → ${subscription.status}`);
};

const handleSubscriptionDeleted = async (subscription) => {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    include: { user: true },
  });
  if (!sub) return;

  // Downgrade to free plan
  const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
  if (!freePlan) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      planId: freePlan.id,
      status: 'ACTIVE',
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date(),
      currentPeriodEnd: null,
    },
  });

  logger.info(`Subscription cancelled — user ${sub.userId} downgraded to FREE`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Get current subscription details
// ─────────────────────────────────────────────────────────────────────────────
const getSubscriptionDetails = async (userId) => {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: true,
    },
  });

  const creditAccount = await prisma.creditAccount.findUnique({ where: { userId } });
  const transactions = await prisma.creditTransaction.findMany({
    where: { creditAccountId: creditAccount?.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    subscription: sub ? {
      plan: sub.plan.displayName,
      planName: sub.plan.name,
      status: sub.status,
      monthlyCredits: sub.plan.monthlyCredits,
      priceUSD: sub.plan.priceUSD,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      hasStripeSubscription: !!sub.stripeSubscriptionId,
    } : null,
    credits: {
      balance: creditAccount?.balance ?? 0,
      totalUsed: creditAccount?.totalUsed ?? 0,
    },
    recentTransactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      reason: t.reason,
      createdAt: t.createdAt,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Get all available plans
// ─────────────────────────────────────────────────────────────────────────────
const getPlans = async () => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceUSD: 'asc' },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    monthlyCredits: p.monthlyCredits,
    priceUSD: p.priceUSD,
    features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
  }));
};

module.exports = {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  getSubscriptionDetails,
  getPlans,
};
