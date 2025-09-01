'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FileX, RefreshCw, AlertCircle } from 'lucide-react';

interface ToolErrorBoundaryProps {
  children: React.ReactNode;
  toolName: string;
}

export function ToolErrorBoundary({ children, toolName }: ToolErrorBoundaryProps) {
  const errorFallback = (
    <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
      <div className="bg-red-100 rounded-full p-3 mx-auto w-fit mb-6">
        <FileX className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {toolName} Error
      </h2>
      
      <p className="text-gray-600 mb-6">
        There was an error processing your PDF with the {toolName.toLowerCase()} tool. 
        This could be due to a corrupted file, unsupported format, or temporary processing issue.
      </p>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-amber-800 mb-1">
              Troubleshooting Tips:
            </h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Make sure your file is a valid PDF</li>
              <li>• Check that the PDF is not password protected</li>
              <li>• Try with a smaller file size</li>
              <li>• Ensure the PDF is not corrupted</li>
            </ul>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={errorFallback}
      onError={(error, errorInfo) => {
        // Log tool-specific errors
        console.error(`${toolName} Error:`, error, errorInfo);
        
        // In production, you might want to track which tools are failing
        if (process.env.NODE_ENV === 'production') {
          // Analytics or error tracking
          // trackEvent('pdf_tool_error', {
          //   tool: toolName,
          //   error: error.message,
          //   stack: error.stack
          // });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ToolErrorBoundary;