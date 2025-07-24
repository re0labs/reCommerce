import { NextResponse } from 'next/server';
import { getDefaultMockResult, ReceptionAnalysisResult } from '../../../data/mockAnalysisResults';

// Helper function to make API call with retry logic
async function makeReceptionApiCall(url: string, apiKey: string, requestBody: Record<string, string>, maxRetries = 1): Promise<Response> {
  const delays = [100, 200, 300]; // Almost instant retries: 100ms, 200ms, 300ms
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} - Making request to reCeption API...`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Attempt ${attempt + 1} - Response status:`, response.status, response.statusText);
      
      return response;
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry (minimal delay)
      const delay = delays[attempt] || 300;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All retry attempts failed');
}

export async function POST() {
  try {
    console.log('Starting contract analysis...');
    
    const receptionApiUrl = process.env.RECEPTION_API_URL || 'https://api.re-labs.io:35765/predict';
    const receptionApiKey = process.env.RECEPTION_API_KEY;
    
    console.log('Environment variables:', {
      receptionApiUrl,
      hasApiKey: !!receptionApiKey,
      apiKeyLength: receptionApiKey?.length
    });
    
    if (!receptionApiKey) {
      console.error('reCeption API key is missing');
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCeption API configuration missing',
          userMessage: 'Contract analysis service is not properly configured. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Import contract source code
    let CONTRACT_NAME, TRANSFERS_CONTRACT_SOURCE;
    try {
      const contractModule = await import('../../../contracts/TransfersContract');
      CONTRACT_NAME = contractModule.CONTRACT_NAME;
      TRANSFERS_CONTRACT_SOURCE = contractModule.TRANSFERS_CONTRACT_SOURCE;
      console.log('Contract imported successfully:', {
        contractName: CONTRACT_NAME,
        contractSourceLength: TRANSFERS_CONTRACT_SOURCE?.length
      });
    } catch (importError) {
      console.error('Failed to import contract:', importError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to load contract source code',
          userMessage: 'Unable to load contract information. Please try again.'
        },
        { status: 500 }
      );
    }

    const requestBody = {
      contract_name: CONTRACT_NAME,
      contract_source_code: TRANSFERS_CONTRACT_SOURCE
    };

    // Make API call with retry logic
    const response = await makeReceptionApiCall(receptionApiUrl, receptionApiKey, requestBody);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('reCeption API error response:', errorText);
      
      let userMessage = 'Contract analysis failed. Please try again.';
      if (response.status >= 500) {
        userMessage = 'Contract analysis service is temporarily unavailable. Please try again later.';
      } else if (response.status === 401 || response.status === 403) {
        userMessage = 'Contract analysis service authentication failed. Please contact support.';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `reCeption API error: ${response.status} ${response.statusText}`, 
          details: errorText,
          userMessage
        },
        { status: response.status }
      );
    }

    const analysisResult = await response.json();
    console.log('Analysis completed successfully');
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Contract analysis error details:', error);
    
    // Check if this is a connection/timeout error that should trigger fallback
    const isConnectionError = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('fetch failed') ||
      error.message.includes('ConnectTimeoutError') ||
      error.message.includes('All retry attempts failed')
    );
    
    if (isConnectionError) {
      console.log('API connection failed, falling back to default analysis data...');
      
      // Return default analysis data as fallback (Security Score 80)
      const mockResult: ReceptionAnalysisResult = getDefaultMockResult();
      
      return NextResponse.json({
        success: true,
        analysis: mockResult,
        fallback_used: true,
        fallback_reason: 'External analysis service temporarily unavailable'
      });
    }
    
    // For other errors, return the original error response
    const userMessage = 'Contract analysis failed due to an unexpected error.';
    const statusCode = 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Contract analysis failed',
        userMessage
      },
      { status: statusCode }
    );
  }
}