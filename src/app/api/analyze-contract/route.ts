import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Starting contract analysis...");

    const receptionApiUrl =
      process.env.RECEPTION_API_URL || "https://api.re-labs.io:22543/predict";
    const receptionApiKey = process.env.RECEPTION_API_KEY;

    if (!receptionApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key not configured",
          userMessage: "Contract analysis not configured.",
        },
        { status: 500 }
      );
    }

    // Import contract
    const contractModule = await import("../../../contracts/TransfersContract");
    const CONTRACT_NAME = contractModule.CONTRACT_NAME;
    const TRANSFERS_CONTRACT_SOURCE = contractModule.TRANSFERS_CONTRACT_SOURCE;

    console.log("Calling reCeption API...");

    // Simple fetch - just like your React app
    const response = await fetch(receptionApiUrl, {
      method: "POST",
      headers: {
        "x-api-key": receptionApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contract_name: CONTRACT_NAME,
        contract_source_code: TRANSFERS_CONTRACT_SOURCE,
      }),
      cache: "no-store", // Important for Next.js - disable caching
    });

    console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: `API returned ${response.status}`,
          userMessage: "Contract analysis failed. Please try again.",
        },
        { status: response.status }
      );
    }

    const analysisResult = await response.json();
    console.log("Analysis success!");

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("Error details:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        userMessage: "Contract analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Add this to prevent Next.js from caching/optimizing this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime, not Edge
