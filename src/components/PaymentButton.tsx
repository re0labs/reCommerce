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
    recommendation: string;
  } | null>(null);
  const [paymentBlocked, setPaymentBlocked] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentBlocked(false);
    
    try {
      onPaymentStart?.();

      // Step 1: Create Coinbase Commerce charge
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

      // Step 2: Simulate contract analysis check
      // In a real implementation, this would be triggered by the webhook
      // For demo purposes, we'll simulate the analysis result
      await simulateContractAnalysis();

      // Step 3: If contract is safe, redirect to Coinbase Commerce
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
    // Simulate reCeption API analysis
    // In practice, this would be handled by the webhook
    const mockAnalysis = {
      contract_safe: Math.random() > 0.3, // 70% chance of safe contract
      risk_score: Math.random() * 100,
      vulnerabilities: Math.random() > 0.7 ? ['Reentrancy detected', 'Integer overflow possible'] : [],
      recommendation: 'Contract analysis complete'
    };

    setContractAnalysis(mockAnalysis);

    if (!mockAnalysis.contract_safe) {
      setPaymentBlocked(true);
      onPaymentError?.('Smart contract failed security analysis. Payment blocked for your protection.');
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading || paymentBlocked}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          paymentBlocked
            ? 'bg-red-500 cursor-not-allowed'
            : loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading 
          ? 'Processing...' 
          : paymentBlocked 
          ? 'Payment Blocked - Unsafe Contract'
          : '💰 Pay w/ Crypto'
        }
      </button>

      {contractAnalysis && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Smart Contract Analysis</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={contractAnalysis.contract_safe ? 'text-green-600' : 'text-red-600'}>
                {contractAnalysis.contract_safe ? 'Safe' : 'Unsafe'}
              </span>
            </p>
            <p>
              <span className="font-medium">Risk Score:</span>{' '}
              {contractAnalysis.risk_score.toFixed(1)}/100
            </p>
            {contractAnalysis.vulnerabilities.length > 0 && (
              <div>
                <span className="font-medium">Vulnerabilities:</span>
                <ul className="list-disc list-inside ml-4">
                  {contractAnalysis.vulnerabilities.map((vuln: string, index: number) => (
                    <li key={index} className="text-red-600">{vuln}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 