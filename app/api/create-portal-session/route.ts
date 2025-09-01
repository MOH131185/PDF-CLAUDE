import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, db } from '@/lib/supabase';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

async function handler(_req: NextRequest) {
  try {
    // Verify user is authenticated
    const { user, error: userError } = await auth.getCurrentUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription to find their Stripe customer ID
    const { subscription, error: subError } = await db.getUserSubscription(user.id);
    
    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return NextResponse.json({ 
      portalUrl: portalSession.url 
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to portal session creation
export const POST = withRateLimit(rateLimiters.moderate, handler);