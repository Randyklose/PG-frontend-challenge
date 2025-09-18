import useSWR from 'swr';
import { TaxBracketsResponse } from '../../types/tax';
import { taxApiService, TaxApiError } from '../../services/taxApi/taxApi';

interface UseTaxBracketsOptions {
  taxYear: number;
  enabled?: boolean;
}

export function useTaxBrackets({ taxYear, enabled = true }: UseTaxBracketsOptions) {
  const { data, error, isLoading, mutate } = useSWR<TaxBracketsResponse, TaxApiError>(
    enabled ? `tax-brackets-${taxYear}` : null,
    () => taxApiService.getTaxBrackets(taxYear),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('Failed to fetch tax brackets:', error);
      },
    }
  );

  return {
    taxBrackets: data?.tax_brackets,
    isLoading,
    error,
    mutate,
  };
}
