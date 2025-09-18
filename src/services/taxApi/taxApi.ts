import { TaxBracketsResponse, TaxCalculationRequest, TaxCalculationResult, TaxBracket } from '../../types/tax';

export class TaxApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly retryable: boolean;

  constructor(message: string, status?: number, code?: string, retryable: boolean = false) {
    super(message);
    this.name = 'TaxApiError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

class TaxApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: 'http://localhost:5001',
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
    };
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const isRetryable = response.status >= 500 || response.status === 429;
        
        throw new TaxApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          isRetryable
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TaxApiError) {
        // If it's a retryable error and we haven't exceeded max retries, retry
        if (error.retryable && retryCount < this.config.maxRetries) {
          console.warn(`API request failed, retrying... (${retryCount + 1}/${this.config.maxRetries})`, error.message);
          await this.delay(this.config.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.fetchWithRetry<T>(url, options, retryCount + 1);
        }
        throw error;
      }

      // Network or other errors
      if (retryCount < this.config.maxRetries) {
        console.warn(`Network error, retrying... (${retryCount + 1}/${this.config.maxRetries})`, error);
        await this.delay(this.config.retryDelay * Math.pow(2, retryCount));
        return this.fetchWithRetry<T>(url, options, retryCount + 1);
      }

      throw new TaxApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        undefined,
        'NETWORK_ERROR',
        true
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTaxBrackets(taxYear: number): Promise<TaxBracketsResponse> {
    const validYears = [2019, 2020, 2021, 2022];
    if (!validYears.includes(taxYear)) {
      throw new TaxApiError(
        `Tax year ${taxYear} is not supported. Supported years: ${validYears.join(', ')}`,
        400,
        'INVALID_TAX_YEAR',
        false
      );
    }

    const url = `${this.config.baseUrl}/tax-calculator/tax-year/${taxYear}`;
    console.log(`Fetching tax brackets for year ${taxYear} from ${url}`);
    
    return this.fetchWithRetry<TaxBracketsResponse>(url);
  }

  calculateTax(request: TaxCalculationRequest): TaxCalculationResult {
    console.log('Calculating tax for:', request);
    
    // This is a client-side calculation based on the tax brackets
    // In a real application, this might be done on the server
    throw new Error('Tax calculation should be done using the getTaxBrackets method and client-side calculation');
  }

  async calculateTaxWithBrackets(request: TaxCalculationRequest): Promise<TaxCalculationResult> {
    const { annualIncome, taxYear } = request;
    
    if (annualIncome < 0) {
      throw new TaxApiError('Annual income cannot be negative', 400, 'INVALID_INCOME', false);
    }

    // Get tax brackets for the specified year
    const bracketsResponse = await this.getTaxBrackets(taxYear);
    const taxBrackets = bracketsResponse.tax_brackets;

    // Calculate tax using marginal tax rates
    let totalTax = 0;
    let remainingIncome = annualIncome;
    const taxPerBracket: Array<{
      bracket: TaxBracket;
      taxableAmount: number;
      taxAmount: number;
    }> = [];

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const bracketMin = bracket.min;
      const bracketMax = bracket.max || Infinity;
      const bracketRate = bracket.rate;

      // Calculate how much income falls in this bracket
      const taxableInBracket = Math.min(remainingIncome, bracketMax - bracketMin);
      
      if (taxableInBracket > 0) {
        const taxInBracket = taxableInBracket * bracketRate;
        totalTax += taxInBracket;
        remainingIncome -= taxableInBracket;

        taxPerBracket.push({
          bracket,
          taxableAmount: taxableInBracket,
          taxAmount: taxInBracket,
        });
      }
    }

    const effectiveRate = annualIncome > 0 ? totalTax / annualIncome : 0;

    const result: TaxCalculationResult = {
      totalTax,
      effectiveRate,
      taxPerBracket,
    };

    console.log('Tax calculation completed:', result);
    return result;
  }
}

export const taxApiService = new TaxApiService();
