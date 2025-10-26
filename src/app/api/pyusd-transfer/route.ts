import { NextRequest, NextResponse } from "next/server";

// This endpoint will return the contract details needed for the frontend
// The actual transfer happens in the user's wallet (MetaMask)
export async function POST(request: NextRequest) {
  try {
    const { productPrice, recipientAddress } = await request.json();

    // pyUSD contract address on Sepolia testnet
    const PYUSD_CONTRACT_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

    // Your merchant wallet address (where you want to receive payment)
    const MERCHANT_ADDRESS =
      recipientAddress ||
      process.env.MERCHANT_WALLET_ADDRESS ||
      "0xb43c9f0f2bb65a37761e7867a6f1903799f45d65";

    if (!MERCHANT_ADDRESS) {
      return NextResponse.json(
        { error: "Merchant wallet address not configured" },
        { status: 500 }
      );
    }

    // Convert USD to pyUSD amount (assuming 1:1 for stablecoin)
    // pyUSD has 6 decimals, so $10 = 10000000 (10 * 10^6)
    const amountInWei = Math.floor(parseFloat(productPrice) * 1_000_000);

    // Return the transfer details to the frontend
    // The frontend will handle the actual MetaMask interaction
    return NextResponse.json({
      success: true,
      transferDetails: {
        contractAddress: PYUSD_CONTRACT_ADDRESS,
        recipientAddress: MERCHANT_ADDRESS,
        amount: amountInWei.toString(),
        decimals: 6,
        symbol: "PYUSD",
        chainId: 11155111, // Sepolia testnet
      },
    });
  } catch (error) {
    console.error("Error preparing transfer:", error);
    return NextResponse.json(
      { error: "Failed to prepare transfer" },
      { status: 500 }
    );
  }
}
