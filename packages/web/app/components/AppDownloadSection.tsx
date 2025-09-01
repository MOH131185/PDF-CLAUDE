'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { analytics } from '@/lib/analytics';
import { APP_STORE_URLS, QR_CODE_CONFIG } from '@pdf-tools/shared';

const AppDownloadSection = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    generateQRCode();
  }, [selectedPlatform]);

  const generateQRCode = async () => {
    try {
      const url = selectedPlatform === 'ios' ? APP_STORE_URLS.IOS : APP_STORE_URLS.ANDROID;
      const qrUrl = await QRCode.toDataURL(url, {
        width: QR_CODE_CONFIG.SIZE,
        margin: QR_CODE_CONFIG.MARGIN,
        color: {
          dark: QR_CODE_CONFIG.COLOR_DARK,
          light: QR_CODE_CONFIG.COLOR_LIGHT,
        },
        errorCorrectionLevel: QR_CODE_CONFIG.ERROR_CORRECTION_LEVEL,
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleQRCodeScan = () => {
    analytics.mobile.qrCodeScanned(selectedPlatform);
  };

  const handleDirectDownload = (platform: 'ios' | 'android') => {
    analytics.mobile.appDownloadClicked(platform, 'direct_link');
    window.open(platform === 'ios' ? APP_STORE_URLS.IOS : APP_STORE_URLS.ANDROID, '_blank');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get PDF Tools on Your Mobile
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Take PDF processing power with you everywhere. Available for iOS and Android.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* QR Code Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Scan to Download
              </h3>
              
              {/* Platform Selector */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlatform === 'ios'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  iOS (iPhone/iPad)
                </button>
                <button
                  onClick={() => setSelectedPlatform('android')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlatform === 'android'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Android
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`QR code for ${selectedPlatform === 'ios' ? 'iOS' : 'Android'} app`}
                      className="w-48 h-48"
                      onClick={handleQRCodeScan}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Scan with your {selectedPlatform === 'ios' ? 'iPhone/iPad' : 'Android'} camera
                  </p>
                </div>
              </div>
            </div>

            {/* App Features & Download Links */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Mobile App Features
              </h3>
              
              <ul className="text-left space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">📱</span>
                  <span className="text-gray-700">Native mobile interface optimized for touch</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">📄</span>
                  <span className="text-gray-700">All PDF tools: merge, split, and compress</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">☁️</span>
                  <span className="text-gray-700">Sync with your web account</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">⚡</span>
                  <span className="text-gray-700">Fast processing, even offline</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">📤</span>
                  <span className="text-gray-700">Easy sharing to any app</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">🔒</span>
                  <span className="text-gray-700">Secure and private processing</span>
                </li>
              </ul>

              {/* Direct Download Buttons */}
              <div className="space-y-4 pt-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Or download directly:
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleDirectDownload('ios')}
                    className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleDirectDownload('android')}
                    className="flex items-center justify-center space-x-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span className="text-2xl">📱</span>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-platform Account Message */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              One Account, All Devices
            </h4>
            <p className="text-blue-700">
              Sign in with the same account on web, iOS, and Android to sync your processing history 
              and subscription across all platforms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;