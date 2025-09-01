import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-08-27.basil',
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
};

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 operations per day',
      'Files up to 10MB',
      'Basic support',
      'All PDF tools',
    ],
    limits: {
      operationsPerDay: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder',
    features: [
      'Unlimited operations',
      'Files up to 100MB',
      'Priority support',
      'Advanced features',
      'API access',
    ],
    limits: {
      operationsPerDay: Infinity,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
  },
};

export type PricingPlan = typeof PRICING_PLANS.free;

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  userId?: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return session;
}

export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });

  return subscriptions.data;
}

export function formatPrice(amount: number, currency: string = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount);
}