import Link from 'next/link';
import { Check, Star } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  popular?: boolean;
}

export default function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonHref,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative p-8 bg-white rounded-xl border-2 shadow-sm ${
        popular
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
          : 'border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>Most Popular</span>
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
    </div>
  );
}