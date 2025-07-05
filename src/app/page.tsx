'use client';

import { useState } from 'react';
import Image from 'next/image';
import Product from '@/components/Product';
import PaymentButton from '@/components/PaymentButton';

// Hardcoded product data as specified in PRD
const DEMO_PRODUCT = {
  name: 'Crypto Security Scanner Pro',
  description: 'Advanced smart contract analysis powered by reCeption AI',
  price: '0.01',
  imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop&crop=center'
};

export default function HomePage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [currentChargeId, setCurrentChargeId] = useState<string>('');

  const handlePaymentStart = () => {
    setPaymentStatus('Initializing secure payment...');
  };

  const handlePaymentSuccess = (chargeId: string) => {
    setCurrentChargeId(chargeId);
    setPaymentStatus('Payment initiated successfully');
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus(`Error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Simple background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      
      {/* Header */}
      <header className="relative z-50 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/reLabs_logo.png"
                  alt="reLabs Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">reCommerce</h1>
                <p className="text-sm text-gray-400">Secure Crypto Shopping</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span>Secured by reCeption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-50 text-center py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="text-white">Secure</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Crypto Commerce
            </span>
          </h2>
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl text-gray-300 text-center">
              AI-powered smart contract analysis protects every transaction
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Powered by re Labs Technology</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-50 container mx-auto px-6 py-16">
        {/* Cards Container */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            
            {/* Product Card */}
            <div className="w-full">
              <Product
                name={DEMO_PRODUCT.name}
                description={DEMO_PRODUCT.description}
                price={DEMO_PRODUCT.price}
                imageUrl={DEMO_PRODUCT.imageUrl}
              />
            </div>

            {/* Checkout Card */}
            <div className="w-full">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 h-fit">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-green-400 to-blue-500"></div>
                  <h3 className="text-xl font-semibold text-white">Secure Checkout</h3>
                </div>
                
                {/* Security Info */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-8">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-300 font-medium">Smart Contract Protection</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Every transaction is analyzed for security vulnerabilities before processing
                  </p>
                </div>

                {/* Payment Button */}
                <PaymentButton
                  productName={DEMO_PRODUCT.name}
                  productPrice={DEMO_PRODUCT.price}
                  onPaymentStart={handlePaymentStart}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />

                {/* Payment Status */}
                {paymentStatus && (
                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-gray-300">{paymentStatus}</p>
                    {currentChargeId && (
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {currentChargeId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Platform Performance</h3>
            <p className="text-gray-400">Real-time security metrics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center group hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                98%
              </div>
              <div className="text-gray-300 font-medium mb-2">Security Score</div>
              <div className="text-gray-500 text-sm">Average contract safety rating</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center group hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                15ms
              </div>
              <div className="text-gray-300 font-medium mb-2">Analysis Time</div>
              <div className="text-gray-500 text-sm">Real-time vulnerability scanning</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center group hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                100%
              </div>
              <div className="text-gray-300 font-medium mb-2">Protected</div>
              <div className="text-gray-500 text-sm">Transactions secured by AI</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50 border-t border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src="/reLabs_logo.png"
                    alt="reLabs Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-white">reCommerce</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Secure cryptocurrency commerce platform powered by reCeption&#39;s advanced AI security analysis.
              </p>
            </div>

            {/* Technology Section */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Technology</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-gray-400 text-sm">Smart Contract Analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-gray-400 text-sm">Real-time Security Scanning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-400 text-sm">AI-Powered Protection</span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Status</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Testnet Active</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-gray-400 text-sm">API Operational</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-gray-400 text-sm">Security Systems Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 reCommerce. Powered by <span className="text-white font-semibold">reCeption</span> & <span className="text-white font-semibold">reLabs</span>
              </p>
              <div className="flex items-center space-x-6">
                <span className="text-gray-500 text-xs">Demo Environment</span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-gray-500 text-xs">No Real Payments</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
