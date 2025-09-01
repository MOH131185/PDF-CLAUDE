import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/supabase';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!endpointSecret || endpointSecret === 'whsec_placeholder') {
      return NextResponse.json({ error: 'Webhook endpoint not configured' }, { status: 400 });
    }

    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No stripe signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Handle successful checkout session
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const typedSub = subscription as any;
    
    // Update user subscription in database
    await db.upsertUserSubscription({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: typedSub.status,
      plan_id: 'pro',
      current_period_start: typedSub.current_period_start ? new Date(typedSub.current_period_start * 1000).toISOString() : undefined,
      current_period_end: typedSub.current_period_end ? new Date(typedSub.current_period_end * 1000).toISOString() : undefined,
    });

    console.log(`Subscription created for user ${userId}: ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    const customerId = subscription.customer as string;

    if (!userId) {
      // Try to find user by customer ID
      console.log(`No userId in subscription metadata, looking up by customer ID: ${customerId}`);
      return;
    }

    const typedSubscription = subscription as any;
    await db.upsertUserSubscription({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: typedSubscription.id,
      status: typedSubscription.status,
      plan_id: 'pro',
      current_period_start: typedSubscription.current_period_start ? new Date(typedSubscription.current_period_start * 1000).toISOString() : undefined,
      current_period_end: typedSubscription.current_period_end ? new Date(typedSubscription.current_period_end * 1000).toISOString() : undefined,
    });

    console.log(`Subscription created: ${subscription.id} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    const customerId = subscription.customer as string;

    if (!userId) {
      console.log(`No userId in subscription metadata for update: ${subscription.id}`);
      return;
    }

    const typedSubscription = subscription as any;
    await db.upsertUserSubscription({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: typedSubscription.id,
      status: typedSubscription.status,
      plan_id: typedSubscription.status === 'active' ? 'pro' : 'free',
      current_period_start: typedSubscription.current_period_start ? new Date(typedSubscription.current_period_start * 1000).toISOString() : undefined,
      current_period_end: typedSubscription.current_period_end ? new Date(typedSubscription.current_period_end * 1000).toISOString() : undefined,
    });

    console.log(`Subscription updated: ${subscription.id} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    const customerId = subscription.customer as string;

    if (!userId) {
      console.log(`No userId in subscription metadata for deletion: ${subscription.id}`);
      return;
    }

    // Update subscription to canceled/free plan
    const typedSubscription = subscription as any;
    await db.upsertUserSubscription({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: typedSubscription.id,
      status: 'canceled',
      plan_id: 'free',
      current_period_start: typedSubscription.current_period_start ? new Date(typedSubscription.current_period_start * 1000).toISOString() : undefined,
      current_period_end: typedSubscription.current_period_end ? new Date(typedSubscription.current_period_end * 1000).toISOString() : undefined,
    });

    console.log(`Subscription canceled: ${subscription.id} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        // Ensure subscription is active
        await db.upsertUserSubscription({
          user_id: userId,
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan_id: 'pro',
          current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : undefined,
          current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : undefined,
        });

        console.log(`Invoice payment succeeded for user ${userId}: ${invoice.id}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        // Update subscription status to past_due
        await db.upsertUserSubscription({
          user_id: userId,
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: subscriptionId,
          status: 'past_due',
          plan_id: 'free', // Downgrade to free on payment failure
          current_period_start: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000).toISOString() : undefined,
          current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : undefined,
        });

        console.log(`Invoice payment failed for user ${userId}: ${invoice.id}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}