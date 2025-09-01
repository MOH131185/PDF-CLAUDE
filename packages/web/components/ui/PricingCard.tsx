'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Star, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref?: string;
  popular?: boolean;
  priceId?: string;
  planId?: string;
  isCurrentPlan?: boolean;
  onUpgrade?: () => void;
}

export default function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonHref,
  popular = false,
  priceId,
  planId = 'free',
  isCurrentPlan = false,
  onUpgrade,
}: PricingCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (!priceId) {
      toast.error('Price ID not configured');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (onUpgrade && planId === 'pro') {
      handleUpgrade();
    }
  };

  return (
    <div
      className={`relative p-8 bg-white rounded-xl border-2 shadow-sm ${
        popular
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
          : 'border-gray-200'
      } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}
    >
      {popular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>Most Popular</span>
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            <Crown className="w-4 h-4 fill-current" />
            <span>Current Plan</span>
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-baseline justify-center mb-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 ml-1">/{period}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      {isCurrentPlan ? (
        <button
          disabled
          className="w-full py-3 px-6 bg-green-100 text-green-800 rounded-lg font-semibold cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : priceId && planId === 'pro' ? (
        <button
          onClick={handleButtonClick}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
            popular
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      ) : buttonHref ? (
        <Link
          href={buttonHref}
          className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
            popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {buttonText}
        </Link>
      ) : (
        <button
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}