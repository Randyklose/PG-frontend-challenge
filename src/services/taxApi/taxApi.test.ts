import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taxApiService, TaxApiError } from './taxApi';
import { TaxBracketsResponse } from '../../types/tax';

// Mock fetch
global.fetch = vi.fn();

describe('TaxApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTaxBrackets', () => {
        it('should fetch tax brackets for valid year', async () => {
          const mockResponse: TaxBracketsResponse = {
            tax_brackets: [
              { min: 0, max: 50197, rate: 0.15 },
              { min: 50197, max: 100392, rate: 0.205 },
              { min: 100392, rate: 0.33 }
            ]
          };

          (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          });

          const result = await taxApiService.getTaxBrackets(2022);

          expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5001/tax-calculator/tax-year/2022',
            expect.objectContaining({
              headers: { 'Content-Type': 'application/json' }
            })
          );
          expect(result).toEqual(mockResponse);
        });

    it('should throw error for invalid year', async () => {
      await expect(taxApiService.getTaxBrackets(2023)).rejects.toThrow(TaxApiError);
      await expect(taxApiService.getTaxBrackets(2023)).rejects.toThrow('Tax year 2023 is not supported');
    });

    it('should handle API errors', async () => {
      // Create a service instance with no retries for testing
      const testService = new (taxApiService.constructor as any)('http://localhost:5001', 0, 100);
      
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(testService.getTaxBrackets(2022)).rejects.toThrow(TaxApiError);
    });

    it('should handle network errors', async () => {
      // Create a service instance with no retries for testing
      const testService = new (taxApiService.constructor as any)('http://localhost:5001', 0, 100);
      
      (fetch as any).mockRejectedValueOnce(new TypeError('Network error'));

      await expect(testService.getTaxBrackets(2022)).rejects.toThrow(TaxApiError);
      await expect(testService.getTaxBrackets(2022)).rejects.toThrow('Network error');
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly for $50,000 income', async () => {
      const mockResponse: TaxBracketsResponse = {
        tax_brackets: [
          { min: 0, max: 50197, rate: 0.15 },
          { min: 50197, max: 100392, rate: 0.205 },
          { min: 100392, rate: 0.33 }
        ]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await taxApiService.calculateTaxWithBrackets({
        annualIncome: 50000,
        taxYear: 2022
      });

      // Expected calculation:
      // First bracket: 50,000 * 0.15 = 7,500
      expect(result.totalTax).toBe(7500);
      expect(result.effectiveRate).toBe(0.15);
      expect(result.taxPerBracket).toHaveLength(1);
    });

    it('should calculate tax correctly for $100,000 income', async () => {
      const mockResponse: TaxBracketsResponse = {
        tax_brackets: [
          { min: 0, max: 50197, rate: 0.15 },
          { min: 50197, max: 100392, rate: 0.205 },
          { min: 100392, rate: 0.33 }
        ]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await taxApiService.calculateTaxWithBrackets({
        annualIncome: 100000,
        taxYear: 2022
      });

      // Expected calculation:
      // First bracket: 50,197 * 0.15 = 7,529.55
      // Second bracket: (100,000 - 50,197) * 0.205 = 49,803 * 0.205 = 10,209.615
      // Total: 7,529.55 + 10,209.615 = 17,739.165
      expect(result.totalTax).toBeCloseTo(17739.17, 2);
      expect(result.effectiveRate).toBeCloseTo(0.1774, 4);
      expect(result.taxPerBracket).toHaveLength(2);
    });

    it('should validate request parameters', async () => {
      await expect(taxApiService.calculateTaxWithBrackets({
        annualIncome: -1000,
        taxYear: 2022
      })).rejects.toThrow(TaxApiError);

      await expect(taxApiService.calculateTaxWithBrackets({
        annualIncome: 50000,
        taxYear: 2023
      })).rejects.toThrow(TaxApiError);
    });
  });
});

