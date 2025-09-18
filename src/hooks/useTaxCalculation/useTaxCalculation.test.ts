import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaxCalculation } from './useTaxCalculation';
import { taxApiService } from '../../services/taxApi/taxApi';
import { TaxApiError } from '../../services/taxApi/taxApi';

// Mock the taxApiService
vi.mock('../../services/taxApi/taxApi', () => ({
  taxApiService: {
    calculateTaxWithBrackets: vi.fn(),
  },
  TaxApiError: class TaxApiError extends Error {
    status?: number;
    code?: string;
    retryable: boolean;
    
    constructor(message: string, status?: number, code?: string, retryable: boolean = false) {
      super(message);
      this.name = 'TaxApiError';
      this.status = status;
      this.code = code;
      this.retryable = retryable;
    }
  },
}));

describe('useTaxCalculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTaxCalculation());

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should calculate tax successfully', async () => {
    const mockResult = {
      totalTax: 7500,
      effectiveRate: 0.15,
      taxPerBracket: [
        {
          bracket: { min: 0, max: 50197, rate: 0.15 },
          taxableAmount: 50000,
          taxAmount: 7500,
        },
      ],
    };

    (taxApiService.calculateTaxWithBrackets as any).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useTaxCalculation());

    await act(async () => {
      await result.current.calculateTax({
        annualIncome: 50000,
        taxYear: 2022,
      });
    });

    expect(result.current.result).toEqual(mockResult);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle calculation errors', async () => {
    const mockError = new TaxApiError('API Error', 500, 'API_ERROR', true);
    (taxApiService.calculateTaxWithBrackets as any).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTaxCalculation());

    await act(async () => {
      await result.current.calculateTax({
        annualIncome: 50000,
        taxYear: 2022,
      });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should clear result when clearResult is called', async () => {
    const mockResult = {
      totalTax: 7500,
      effectiveRate: 0.15,
      taxPerBracket: [],
    };

    (taxApiService.calculateTaxWithBrackets as any).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useTaxCalculation());

    // First calculate tax
    await act(async () => {
      await result.current.calculateTax({
        annualIncome: 50000,
        taxYear: 2022,
      });
    });

    expect(result.current.result).toEqual(mockResult);

    // Then clear result
    act(() => {
      result.current.clearResult();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
