import React, { useState, useCallback } from 'react';
import { TaxCalculationRequest, TaxCalculationResult } from '../../types/tax';
import { taxApiService, TaxApiError } from '../../services/taxApi/taxApi';

interface UseTaxCalculationResult {
  calculateTax: (request: TaxCalculationRequest) => Promise<void>;
  result: TaxCalculationResult | null;
  isLoading: boolean;
  error: TaxApiError | Error | null;
  clearResult: () => void;
}

export const useTaxCalculation = (): UseTaxCalculationResult => {
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TaxApiError | Error | null>(null);

  const calculateTax = useCallback(async (request: TaxCalculationRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const calculationResult = await taxApiService.calculateTaxWithBrackets(request);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    calculateTax,
    result,
    isLoading,
    error,
    clearResult,
  };
};
