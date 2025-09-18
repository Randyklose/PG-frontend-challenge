export interface TaxBracket {
  min: number;
  max?: number;
  rate: number;
}

export interface TaxBracketsResponse {
  tax_brackets: TaxBracket[];
}

export interface TaxCalculationResult {
  totalTax: number;
  effectiveRate: number;
  taxPerBracket: Array<{
    bracket: TaxBracket;
    taxableAmount: number;
    taxAmount: number;
  }>;
}

export interface TaxCalculationRequest {
  annualIncome: number;
  taxYear: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface TaxApiError extends Error {
  status?: number;
  code?: string;
  retryable: boolean;
}