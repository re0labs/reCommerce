import { NextResponse } from "next/server";

// Helper function to make API call with proper timeout
async function makeReceptionApiCall(
  url: string,
  apiKey: string,
  requestBody: Record<string, string>,
  maxRetries = 2
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `Attempt ${attempt + 1}/${maxRetries} - Calling reCeption API...`
      );

      // Create AbortController with 30 second timeout (API can be slow)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Attempt ${attempt + 1} - Status: ${response.status}`);

      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait 2 seconds before retry
      console.log("Retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("All retry attempts failed");
}

export async function POST() {
  try {
    console.log("Starting contract analysis...");

    const receptionApiUrl =
      process.env.RECEPTION_API_URL || "https://api.re-labs.io:22543/predict";
    const receptionApiKey = process.env.RECEPTION_API_KEY;

    console.log("Environment:", {
      url: receptionApiUrl,
      hasKey: !!receptionApiKey,
    });

    if (!receptionApiKey) {
      console.error("API key missing");
      return NextResponse.json(
        {
          success: false,
          error: "API configuration missing",
          userMessage: "Contract analysis not configured. Contact support.",
        },
        { status: 500 }
      );
    }

    // Import contract source code
    let CONTRACT_NAME, TRANSFERS_CONTRACT_SOURCE;
    try {
      const contractModule = await import(
        "../../../contracts/TransfersContract"
      );
      CONTRACT_NAME = contractModule.CONTRACT_NAME;
      TRANSFERS_CONTRACT_SOURCE = contractModule.TRANSFERS_CONTRACT_SOURCE;
      console.log("Contract loaded:", CONTRACT_NAME);
    } catch (importError) {
      console.error("Failed to import contract:", importError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to load contract",
          userMessage: "Unable to load contract. Try again.",
        },
        { status: 500 }
      );
    }

    const requestBody = {
      contract_name: CONTRACT_NAME,
      contract_source_code: TRANSFERS_CONTRACT_SOURCE,
    };

    // Make API call with retry logic
    const response = await makeReceptionApiCall(
      receptionApiUrl,
      receptionApiKey,
      requestBody
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: `API error: ${response.status}`,
          details: errorText,
          userMessage: "Contract analysis failed. Please try again.",
        },
        { status: response.status }
      );
    }

    const analysisResult = await response.json();
    console.log("Analysis completed successfully!");

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // NO FALLBACK - Just fail properly
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        userMessage:
          "Contract analysis failed. The API might be slow or unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}
