'use client';

import { useState } from 'react';
import Product from '@/components/Product';
import PaymentButton from '@/components/PaymentButton';

// Hardcoded product data as specified in PRD
const DEMO_PRODUCT = {
  name: 'Crypto Security Scanner Pro',
  description: 'Advanced smart contract analysis tool powered by reCeption API. Protect your crypto transactions with real-time contract security scanning and vulnerability detection.',
  price: '0.01',
  imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop&crop=center'
};

export default function HomePage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [currentChargeId, setCurrentChargeId] = useState<string>('');

  const handlePaymentStart = () => {
    setPaymentStatus('Creating payment...');
  };

  const handlePaymentSuccess = (chargeId: string) => {
    setCurrentChargeId(chargeId);
    setPaymentStatus('Payment initiated successfully! Complete your payment in the new window.');
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus(`Payment error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">reCommerce</h1>
            <p className="text-gray-600 mt-2">
              Demo Store • Powered by reCeption Smart Contract Analysis
            </p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🧪 Testnet Environment - Safe Testing Only
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Product Display */}
          <div>
            <Product
              name={DEMO_PRODUCT.name}
              description={DEMO_PRODUCT.description}
              price={DEMO_PRODUCT.price}
              imageUrl={DEMO_PRODUCT.imageUrl}
            />
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Secure Crypto Payment</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-4">
                Your payment will be protected by reCeption&apos;s smart contract analysis. 
                We automatically scan and verify the security of all cryptocurrency transactions.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Smart Contract Protection:</strong> reCeption will analyze the payment contract for security vulnerabilities before processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <PaymentButton
              productName={DEMO_PRODUCT.name}
              productPrice={DEMO_PRODUCT.price}
              onPaymentStart={handlePaymentStart}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />

            {/* Payment Status */}
            {paymentStatus && (
              <div className="mt-4 p-3 border rounded-lg">
                <p className="text-sm">{paymentStatus}</p>
                {currentChargeId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Charge ID: {currentChargeId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Demo Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">About This Demo</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">reCeption Integration</h4>
              <p>
                This demo showcases how reCeption API analyzes smart contracts during cryptocurrency 
                payments, providing real-time security assessment and protecting users from malicious contracts.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Flow</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click &quot;Pay w/ Crypto&quot; to initiate payment</li>
                <li>reCeption analyzes the smart contract</li>
                <li>Payment proceeds only if contract is safe</li>
                <li>Complete payment via Coinbase Commerce</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>
            Powered by <strong>reCeption</strong> • Smart Contract Security Analysis by re Labs
          </p>
          <p className="mt-1 text-xs text-green-600">
            🧪 Running on Testnet/Sandbox - No real payments processed
          </p>
        </div>
      </footer>
    </div>
  );
}
