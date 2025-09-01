'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/hooks/useOperations';
import { FileText, Merge, Split, Archive, Clock, Download, Crown, AlertCircle, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { operations, isLoading, remainingOperations, isProUser, subscription } = useOperations();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user || !isProUser) {
      toast.error('Please upgrade to Pro to manage your subscription');
      return;
    }

    setPortalLoading(true);

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const tools = [
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDF files into one',
      icon: Merge,
      href: '/merge-pdf',
      color: 'bg-blue-500',
    },
    {
      name: 'Split PDF',
      description: 'Extract pages or split PDF into multiple files',
      icon: Split,
      href: '/split-pdf',
      color: 'bg-green-500',
    },
    {
      name: 'Compress PDF',
      description: 'Reduce PDF file size',
      icon: Archive,
      href: '/compress-pdf',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.email ? `, ${user.email}` : ''}!
          </h1>
          <p className="text-gray-600">
            Choose a tool to start working with your PDF files.
          </p>
          
          {/* Usage Status */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isProUser ? (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200">
                  <Crown className="w-5 h-5" />
                  <span className="font-medium">Pro Plan - Unlimited Operations</span>
                </div>
              ) : (
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  remainingOperations > 2 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : remainingOperations > 0 
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {remainingOperations} operations remaining today
                  </span>
                </div>
                {remainingOperations === 0 && (
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Upgrade to Pro</span>
                  </Link>
                )}
              </div>
              )}
            </div>
            
            {/* Manage Subscription Button */}
            {isProUser && subscription && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {portalLoading ? 'Loading...' : 'Manage Subscription'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600">{tool.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Operations
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading operations...</p>
              </div>
            ) : operations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No operations yet. Start by using one of the tools above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {operations.map((operation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{operation.type}</p>
                        <p className="text-sm text-gray-500">{operation.filename}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(operation.created_at).toLocaleDateString()}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}