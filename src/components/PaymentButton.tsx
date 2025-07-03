'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  productName: string;
  productPrice: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (chargeId: string) => void;
  onPaymentError?: (error: string) => void;
}

export default function PaymentButton({
  productName,
  productPrice,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [contractAnalysis, setContractAnalysis] = useState<{
    contract_safe: boolean;
    risk_score: number;
    vulnerabilities: string[];
  } | null>(null);
  const [paymentBlocked, setPaymentBlocked] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentBlocked(false);
    
    try {
      onPaymentStart?.();

      // Create Coinbase Commerce charge
      const response = await fetch('/api/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          productPrice
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create charge');
      }

      const charge = data.charge;

      // Simulate contract analysis
      await simulateContractAnalysis();

      // If contract is safe, redirect to payment
      if (!paymentBlocked) {
        window.open(charge.hosted_url, '_blank');
        onPaymentSuccess?.(charge.id);
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const simulateContractAnalysis = async () => {
    const mockAnalysis = {
      contract_safe: Math.random() > 0.2, // 80% chance of safe contract
      risk_score: Math.random() * 100,
      vulnerabilities: Math.random() > 0.8 ? ['Reentrancy detected'] : [],
    };

    setContractAnalysis(mockAnalysis);

    if (!mockAnalysis.contract_safe) {
      setPaymentBlocked(true);
      onPaymentError?.('Smart contract security risk detected. Payment blocked.');
    }
  };

  return (
    <div className="w-full space-y-4">
      <button
        onClick={handlePayment}
        disabled={loading || paymentBlocked}
        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-white text-base sm:text-lg transition-all duration-300 ${
          paymentBlocked
            ? 'bg-gradient-to-r from-red-500 to-red-600 cursor-not-allowed'
            : loading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </div>
        ) : paymentBlocked ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm sm:text-base">Payment Blocked</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm2-2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span>Pay with Crypto</span>
          </div>
        )}
      </button>

      {contractAnalysis && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <h4 className="font-semibold text-white text-sm">Security Analysis</h4>
            <div className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
              contractAnalysis.contract_safe 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {contractAnalysis.contract_safe ? 'SAFE' : 'RISK DETECTED'}
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Score</span>
              <span className="text-white font-medium">
                {contractAnalysis.risk_score.toFixed(1)}/100
              </span>
            </div>
            
            {contractAnalysis.vulnerabilities.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-red-400 text-xs">⚠ Vulnerabilities detected</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 