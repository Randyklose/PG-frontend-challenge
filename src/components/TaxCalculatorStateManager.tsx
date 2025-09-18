import React from 'react';
import { Box } from '@mui/material';
import { TaxCalculatorForm } from './TaxCalculatorForm/TaxCalculatorForm';
import { LoadingSpinner } from './LoadingSpinner';
import { TaxCalculationResults } from './TaxCalculationResults/TaxCalculationResults';
import { ErrorDisplay } from './ErrorDisplay';
import { TaxCalculationResult, TaxCalculationRequest } from '../types/tax';

interface Props {
  appState: 'idle' | 'loading' | 'success' | 'error';
  result: TaxCalculationResult | null;
  lastRequest: TaxCalculationRequest | null;
  error: Error | null;
  onSubmit: (request: TaxCalculationRequest) => void;
  onNewCalculation: () => void;
  onRetry: () => void;
}

export const TaxCalculatorStateManager: React.FC<Props> = ({
  appState,
  result,
  lastRequest,
  error,
  onSubmit,
  onNewCalculation,
  onRetry
}) => {
  switch (appState) {
    case 'idle':
      return <TaxCalculatorForm onSubmit={onSubmit} isLoading={false} />;
      
    case 'loading':
      return <LoadingSpinner message="Calculating your tax..." />;
      
    case 'success':
      return result && lastRequest ? (
        <Box>
          <TaxCalculationResults 
            result={result}
            annualIncome={lastRequest.annualIncome}
            taxYear={lastRequest.taxYear}
          />
          <Box textAlign="center" mt={3}>
            <button onClick={onNewCalculation} className="new-calculation-button">
              Calculate Another Tax
            </button>
          </Box>
        </Box>
      ) : null;
      
    case 'error':
      return error ? (
        <Box>
          <ErrorDisplay error={error} onRetry={onRetry} />
          <Box textAlign="center" mt={3}>
            <button onClick={onNewCalculation} className="new-calculation-button">
              Start Over
            </button>
          </Box>
        </Box>
      ) : null;
      
    default:
      return null;
  }
};