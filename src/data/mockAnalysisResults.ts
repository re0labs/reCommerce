export interface ReceptionAnalysisResult {
  contract_safe: boolean;
  risk_score: number;
  vulnerabilities: string[];
  analysis_details?: Record<string, unknown>;
  is_demo_data?: boolean;
}

export const mockAnalysisResults: ReceptionAnalysisResult[] = [
  // Safe contract scenario - Low risk
  {
    contract_safe: true,
    risk_score: 8,
    vulnerabilities: [],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 12,
      gas_optimization_score: 85
    }
  },
  
  // Safe contract scenario - Very low risk with minor informational findings
  {
    contract_safe: true,
    risk_score: 15,
    vulnerabilities: [
      "Informational: Consider adding more detailed natspec documentation for public functions"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 11,
      gas_optimization_score: 78
    }
  },

  // Medium risk scenario - Safe but with some concerns
  {
    contract_safe: true,
    risk_score: 35,
    vulnerabilities: [
      "Low: Potential for improved access control granularity in admin functions",
      "Informational: Consider implementing event emission for critical state changes"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 10,
      gas_optimization_score: 72
    }
  },

  // Medium-high risk scenario - Safe but requires attention
  {
    contract_safe: true,
    risk_score: 52,
    vulnerabilities: [
      "Medium: Centralization risk due to owner-controlled pause functionality",
      "Low: Potential gas optimization opportunities in batch operations",
      "Low: Consider implementing maximum transaction limits for enhanced security"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 9,
      gas_optimization_score: 65
    }
  },

  // High risk scenario - Unsafe contract
  {
    contract_safe: false,
    risk_score: 76,
    vulnerabilities: [
      "Critical: Potential reentrancy vulnerability in withdrawal function",
      "High: Insufficient access control on sensitive administrative functions",
      "Medium: Lack of proper input validation on external calls",
      "Medium: Centralized control poses significant risks to user funds"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 6,
      gas_optimization_score: 45
    }
  },

  // Very high risk scenario - Definitely unsafe
  {
    contract_safe: false,
    risk_score: 89,
    vulnerabilities: [
      "Critical: Multiple reentrancy attack vectors identified",
      "Critical: Unprotected external calls to untrusted contracts",
      "High: Integer overflow/underflow vulnerabilities in token calculations",
      "High: Missing proper authorization checks on fund transfer functions",
      "Medium: Hardcoded addresses create immutable dependencies",
      "Medium: Potential for front-running attacks in transaction ordering"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 3,
      gas_optimization_score: 32
    }
  }
];

export function getRandomMockResult(): ReceptionAnalysisResult {
  const randomIndex = Math.floor(Math.random() * mockAnalysisResults.length);
  return mockAnalysisResults[randomIndex];
}

export function getMockResultBySafety(safe: boolean): ReceptionAnalysisResult {
  const safeResults = mockAnalysisResults.filter(result => result.contract_safe === safe);
  const randomIndex = Math.floor(Math.random() * safeResults.length);
  return safeResults[randomIndex];
}

export function getDefaultMockResult(): ReceptionAnalysisResult {
  return {
    contract_safe: true,
    risk_score: 20, // Security Score will display as 80 (100 - 20)
    vulnerabilities: [
      "Informational: Contract follows security best practices",
      "Low: Consider implementing additional gas optimizations for batch operations"
    ],
    is_demo_data: true,
    analysis_details: {
      scanned_functions: 12,
      security_checks_passed: 11,
      gas_optimization_score: 80
    }
  };
}