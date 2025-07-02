import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Commerce = require('coinbase-commerce-node');

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');

    if (!process.env.COINBASE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Initialize Commerce client for webhook verification
    Commerce.Client.init(process.env.COINBASE_COMMERCE_API_KEY);
    
    // Verify webhook signature
    const { Webhook } = Commerce;
    let event;
    try {
      event = Webhook.verifyEventBody(body, signature, process.env.COINBASE_WEBHOOK_SECRET);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle charge:created event - trigger reCeption analysis
    if (event.type === 'charge:created') {
      const charge = event.data;
      console.log('Processing charge:created for charge ID:', charge.id);

      // Extract contract details from charge metadata
      const contractName = charge.metadata?.contract_name;
      const contractSourceCode = charge.metadata?.contract_source_code;

      if (contractName && contractSourceCode) {
        try {
          // Call reCeption API for smart contract analysis
          const receptionResponse = await analyzeSmartContract(contractName, contractSourceCode);
          
          console.log('reCeption analysis result:', receptionResponse);

          // Store the analysis result (in a real app, you'd save this to a database)
          // For now, we'll return it in the response
          return NextResponse.json({
            success: true,
            event_type: event.type,
            charge_id: charge.id,
            reception_analysis: receptionResponse
          });

        } catch (error) {
          console.error('reCeption API error:', error);
          return NextResponse.json({
            success: false,
            event_type: event.type,
            charge_id: charge.id,
            error: 'Failed to analyze smart contract'
          });
        }
      }
    }

    // Handle other webhook events
    return NextResponse.json({
      success: true,
      event_type: event.type,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function analyzeSmartContract(contractName: string, contractSourceCode: string) {
  if (!process.env.RECEPTION_API_KEY || !process.env.RECEPTION_API_URL) {
    throw new Error('reCeption API configuration missing');
  }

  const response = await axios.post(
    process.env.RECEPTION_API_URL,
    {
      contract_name: contractName,
      contract_source_code: contractSourceCode
    },
    {
      headers: {
        'x-api-key': process.env.RECEPTION_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
} 