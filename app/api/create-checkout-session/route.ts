import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, db } from '@/lib/supabase';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handler(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json();

    // Validate required parameters
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: priceId and userId' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const { user, error: userError } = await auth.getCurrentUser();
    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create customer
    let stripeCustomerId: string;
    
    // Check if user already has a subscription record with Stripe customer ID
    const { subscription } = await db.getUserSubscription(userId);
    
    if (subscription?.stripe_customer_id && subscription.stripe_customer_id !== `temp_${userId}`) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Update subscription record with real Stripe customer ID
      await db.upsertUserSubscription({
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        plan_id: 'free',
        status: 'active',
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
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
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to checkout sessions
export const POST = withRateLimit(rateLimiters.payment, handler);