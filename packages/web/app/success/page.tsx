'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2, CreditCard, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface CheckoutSessionData {
  id: string;
  customer_email: string;
  subscription_id?: string;
  status: string;
  amount_total: number;
  currency: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<CheckoutSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    const fetchSessionData = async () => {
      try {
        const response = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve session');
        }

        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to confirm payment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    // Redirect to login if not authenticated after 3 seconds
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        router.push('/auth/signin?redirect=/success');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Confirming your payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-fit mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'We could not verify your payment. Please contact support if you were charged.'}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="bg-green-100 rounded-full p-4 mx-auto w-fit mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to PDF Tools Pro! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your payment was successful
          </p>
          <p className="text-gray-500">
            Session ID: {sessionData.id}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Payment Summary
            </h2>
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>Pro Plan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-lg text-gray-900">{sessionData.customer_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
              <p className="text-lg text-gray-900">
                ${(sessionData.amount_total / 100).toFixed(2)} {sessionData.currency.toUpperCase()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <p className="text-lg text-green-600 font-medium capitalize">
                {sessionData.status}
              </p>
            </div>
            {sessionData.subscription_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription</h3>
                <p className="text-lg text-gray-900">Active</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What&apos;s Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Unlimited PDF Operations</h3>
                <p className="text-gray-600">Merge, split, and compress as many PDFs as you need.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Priority Processing</h3>
                <p className="text-gray-600">Your files are processed with priority queue access.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Advanced Features</h3>
                <p className="text-gray-600">Access to premium PDF manipulation tools.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          {!user && (
            <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              Please sign in to access your Pro features. You&apos;ll be redirected to the login page shortly.
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Start Using Tools
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@pdftools.com" className="text-blue-600 hover:underline">
              support@pdftools.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your payment confirmation.</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}