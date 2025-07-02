import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Commerce = require('coinbase-commerce-node');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chargeId } = await params;

    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      return NextResponse.json(
        { error: 'Coinbase Commerce API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Coinbase Commerce (use sandbox API keys for testnet)
    Commerce.Client.init(process.env.COINBASE_COMMERCE_API_KEY);
    const { Charge } = Commerce.resources;

    // Retrieve charge details
    const charge = await Charge.retrieve(chargeId);

    return NextResponse.json({
      success: true,
      charge: {
        id: charge.id,
        code: charge.code,
        name: charge.name,
        description: charge.description,
        pricing: charge.pricing,
        payments: charge.payments,
        timeline: charge.timeline,
        metadata: charge.metadata,
        hosted_url: charge.hosted_url,
        created_at: charge.created_at,
        expires_at: charge.expires_at
      }
    });

  } catch (error) {
    console.error('Error retrieving charge:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve charge status' },
      { status: 500 }
    );
  }
} 