/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import AnalysisModal from "./AnalysisModal";
import { CONTRACT_ADDRESS } from "../contracts/TransfersContract";

interface PaymentButtonProps {
  productName: string;
  productPrice: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (txHash: string) => void;
  onPaymentError?: (error: string) => void;
}

interface ReceptionAnalysisResult {
  vulnerabilities: string[];
  analysis_details?: Record<string, unknown>;
  is_demo_data?: boolean;
  prediction?: string;
  confidence?: number;
}

// Declare ethereum type for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PaymentButton({
  productName,
  productPrice,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [contractAnalysis, setContractAnalysis] =
    useState<ReceptionAnalysisResult | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [paymentBlocked, setPaymentBlocked] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentBlocked(false);
    setShowAnalysisModal(true);

    try {
      onPaymentStart?.();

      // Call reCeption API to analyze contract
      const analysisResult = await analyzeContractWithReception();
      console.log(analysisResult);

      setContractAnalysis(analysisResult);
      setShowAnalysisModal(false);

      if (!analysisResult.prediction) {
        setPaymentBlocked(true);
        onPaymentError?.(
          `Smart contract security risk detected. Security Score: ${Math.round(
            100 - analysisResult.confidence! * 100
          )}/100. Payment blocked.`
        );
        return;
      }

      // Show approval modal with analysis results
      setShowApprovalModal(true);
    } catch (error) {
      console.error("Contract analysis error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Contract analysis failed";
      onPaymentError?.(errorMessage);
      setShowAnalysisModal(false);
    } finally {
      setLoading(false);
    }
  };

  const analyzeContractWithReception =
    async (): Promise<ReceptionAnalysisResult> => {
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Contract analysis failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        const errorMessage =
          data.userMessage || data.error || "Contract analysis failed";
        throw new Error(errorMessage);
      }

      return data.analysis;
    };

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      // Switch to Sepolia network
      await switchToSepolia();

      setWalletConnected(true);
      return accounts[0];
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    }
  };

  const switchToSepolia = async () => {
    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex (11155111)
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const executePayment = async () => {
    try {
      setLoading(true);

      // Connect wallet and switch to Sepolia
      const userAddress = await connectWallet();
      console.log("Connected wallet:", userAddress);

      // Get transfer details from backend
      const response = await fetch("/api/pyusd-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productPrice,
        }),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Failed to prepare transfer");
      }

      const { transferDetails } = responseData;

      // Manually encode the transfer function call (no library needed!)
      // Function signature: transfer(address,uint256)
      const functionSignature = "0xa9059cbb"; // First 4 bytes of keccak256("transfer(address,uint256)")

      // Encode recipient address (pad to 32 bytes)
      const recipientEncoded = transferDetails.recipientAddress
        .slice(2)
        .padStart(64, "0");

      // Encode amount (pad to 32 bytes)
      const amountHex = parseInt(transferDetails.amount).toString(16);
      const amountEncoded = amountHex.padStart(64, "0");

      // Combine: function signature + recipient + amount
      const txData = functionSignature + recipientEncoded + amountEncoded;

      // Create transaction parameters
      const txParams = {
        from: userAddress,
        to: transferDetails.contractAddress,
        data: txData,
      };

      // Send transaction through MetaMask
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      console.log("Transaction sent:", txHash);
      onPaymentSuccess?.(txHash);

      // Show success message
      alert(`Payment successful! Transaction: ${txHash}`);
    } catch (error) {
      console.error("Payment execution error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (approved: boolean) => {
    setShowApprovalModal(false);

    if (!approved) {
      onPaymentError?.("Payment cancelled by user");
      return;
    }

    // Execute the pyUSD transfer
    await executePayment();
  };

  return (
    <div className="w-full space-y-4">
      <button
        onClick={handlePayment}
        disabled={loading || paymentBlocked}
        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-white text-base sm:text-lg transition-all duration-300 ${
          paymentBlocked
            ? "bg-gradient-to-r from-red-500 to-red-600 cursor-not-allowed"
            : loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </div>
        ) : paymentBlocked ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm sm:text-base">Payment Blocked</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm2-2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span>Pay with pyUSD</span>
          </div>
        )}
      </button>

      {contractAnalysis && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white text-sm">
                Security Analysis
              </h4>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                contractAnalysis.prediction
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {contractAnalysis.prediction ? "SAFE" : "RISK DETECTED"}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Security Score</span>
              <span className="text-white font-medium">
                {Math.round(100 - contractAnalysis.confidence! * 100)}/100
              </span>
            </div>

            {contractAnalysis?.vulnerabilities?.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-red-400 text-xs">
                  ⚠ Vulnerabilities detected
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />

      {/* Approval Modal */}
      {showApprovalModal && contractAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowApprovalModal(false)}
          />
          <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-white">
                  Security Analysis Complete
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Contract: Coinbase Transfers ({CONTRACT_ADDRESS.slice(0, 6)}...
                {CONTRACT_ADDRESS.slice(-4)})
              </p>
            </div>

            <div className="mb-6">
              <div
                className={`p-4 rounded-xl border ${
                  contractAnalysis.prediction
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Security Score</span>
                  <span
                    className={`text-2xl font-bold ${
                      contractAnalysis.confidence! * 100 < 30
                        ? "text-green-400"
                        : contractAnalysis.confidence! * 100 < 60
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {Math.round(100 - contractAnalysis.confidence! * 100)}/100
                  </span>
                </div>
                <div
                  className={`text-xs font-medium ${
                    contractAnalysis.prediction
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {contractAnalysis.prediction
                    ? "✓ SAFE TO PROCEED"
                    : "⚠ RISKS DETECTED"}
                </div>

                {contractAnalysis?.vulnerabilities?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-red-400 text-xs mb-1">
                      Vulnerabilities found:
                    </p>
                    <ul className="text-xs text-gray-300">
                      {contractAnalysis?.vulnerabilities?.map((vuln, idx) => (
                        <li key={idx}>• {vuln}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleUserApproval(false)}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUserApproval(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  contractAnalysis.prediction
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
              >
                {contractAnalysis.prediction
                  ? "Connect & Pay"
                  : "Accept Risk & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
