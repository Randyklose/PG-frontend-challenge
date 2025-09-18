import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useTaxBrackets } from './useTaxBrackets';
import { taxApiService } from '../../services/taxApi/taxApi';
import { TaxBracketsResponse } from '../../types/tax';

// Mock the taxApiService
vi.mock('../../services/taxApi/taxApi', () => ({
  taxApiService: {
    getTaxBrackets: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
};

describe('useTaxBrackets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tax brackets successfully', async () => {
    const mockBrackets: TaxBracketsResponse = {
      tax_brackets: [{ min: 0, max: 50000, rate: 0.15 }],
    };
    (taxApiService.getTaxBrackets as any).mockResolvedValue(mockBrackets);

    const { result } = renderHook(() => useTaxBrackets({ taxYear: 2022 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.taxBrackets).toEqual(mockBrackets.tax_brackets);
    expect(result.current.error).toBeUndefined();
    expect(taxApiService.getTaxBrackets).toHaveBeenCalledWith(2022);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('API Error');
    (taxApiService.getTaxBrackets as any).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTaxBrackets({ taxYear: 2022 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.taxBrackets).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });

  it('should not fetch when disabled', () => {
    renderHook(() => useTaxBrackets({ taxYear: 2022, enabled: false }), { wrapper });
    expect(taxApiService.getTaxBrackets).not.toHaveBeenCalled();
  });

  it('should refetch when tax year changes', async () => {
    const mockResponse2022: TaxBracketsResponse = {
      tax_brackets: [{ min: 0, max: 50197, rate: 0.15 }],
    };
    const mockResponse2021: TaxBracketsResponse = {
      tax_brackets: [{ min: 0, max: 49020, rate: 0.15 }],
    };

    (taxApiService.getTaxBrackets as any)
      .mockResolvedValueOnce(mockResponse2022)
      .mockResolvedValueOnce(mockResponse2021);

    const { result, rerender } = renderHook(
      ({ taxYear }) => useTaxBrackets({ taxYear }),
      { wrapper, initialProps: { taxYear: 2022 } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.taxBrackets).toEqual(mockResponse2022.tax_brackets);

    // Change tax year
    rerender({ taxYear: 2021 });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.taxBrackets).toEqual(mockResponse2021.tax_brackets);
    expect(taxApiService.getTaxBrackets).toHaveBeenCalledTimes(2);
  });
});