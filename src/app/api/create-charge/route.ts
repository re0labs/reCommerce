import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Commerce = require("coinbase-commerce-node");

export async function POST(request: NextRequest) {
  try {
    const { productName, productPrice } = await request.json();

    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      return NextResponse.json(
        { error: "Coinbase Commerce API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Coinbase Commerce (use sandbox API keys for testnet)
    Commerce.Client.init(process.env.COINBASE_COMMERCE_API_KEY);
    const { Charge } = Commerce.resources;

    // Create charge data
    const chargeData = {
      name: productName,
      description: `Purchase of ${productName}`,
      pricing_type: "fixed_price",
      local_price: {
        amount: productPrice,
        currency: "USD",
      },
      metadata: {
        product_name: productName,
        product_price: productPrice,
        // Mock smart contract data for demo
        contract_name: "DemoSmartContract",
        contract_source_code: `pragma solidity ^0.8.0;
contract DemoSmartContract {
    address public owner;
    mapping(address => uint256) public balances;
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}`,
      },
    };

    // Create the charge
    const charge = await Charge.create(chargeData);
    console.log("Charge:", charge);

    return NextResponse.json({
      success: true,
      charge: {
        id: charge.id,
        code: charge.code,
        hosted_url: charge.hosted_url,
        pricing: charge.pricing,
      },
    });
  } catch (error) {
    console.error("Error creating charge:", error);
    return NextResponse.json(
      { error: "Failed to create charge" },
      { status: 500 }
    );
  }
}
