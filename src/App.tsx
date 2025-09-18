import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import { TaxCalculatorForm } from './components/TaxCalculatorForm/TaxCalculatorForm';
import { TaxCalculationResults } from './components/TaxCalculationResults/TaxCalculationResults';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useTaxCalculation } from './hooks/useTaxCalculation/useTaxCalculation';
import { TaxCalculationRequest } from './types/tax';
import { theme } from './theme/theme';
import { logger } from './services/logger';
import './App.css';

function App() {
  const { calculateTax, result, isLoading, error, clearResult } = useTaxCalculation();
  const [lastRequest, setLastRequest] = React.useState<TaxCalculationRequest | null>(null);

  const handleTaxCalculation = React.useCallback(async (request: TaxCalculationRequest) => {
    logger.info('Starting tax calculation', { request });
    setLastRequest(request);
    await calculateTax(request);
  }, [calculateTax]);

  const handleRetry = React.useCallback(() => {
    if (lastRequest) {
      logger.info('Retrying tax calculation', { request: lastRequest });
      calculateTax(lastRequest);
    }
  }, [lastRequest, calculateTax]);

  const handleNewCalculation = React.useCallback(() => {
    logger.info('Starting new calculation');
    clearResult();
    setLastRequest(null);
  }, [clearResult]);

  const getAppState = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (result) return 'success';
    return 'idle';
  };

  const appState = getAppState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h1" component="h1" gutterBottom>
                Tax Calculator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Calculate your income tax using Canadian marginal tax rates
              </Typography>
            </Box>

            {appState === 'idle' && (
              <TaxCalculatorForm 
                onSubmit={handleTaxCalculation}
                isLoading={false}
              />
            )}

            {appState === 'loading' && (
              <LoadingSpinner message="Calculating your tax..." />
            )}

            {appState === 'success' && result && lastRequest && (
              <Box>
                <TaxCalculationResults 
                  result={result}
                  annualIncome={lastRequest.annualIncome}
                  taxYear={lastRequest.taxYear}
                />
                <Box textAlign="center" mt={3}>
                  <button 
                    onClick={handleNewCalculation}
                    className="new-calculation-button"
                  >
                    Calculate Another Tax
                  </button>
                </Box>
              </Box>
            )}

            {appState === 'error' && error && (
              <Box>
                <ErrorDisplay 
                  error={error}
                  onRetry={handleRetry}
                />
                <Box textAlign="center" mt={3}>
                  <button 
                    onClick={handleNewCalculation}
                    className="new-calculation-button"
                  >
                    Start Over
                  </button>
                </Box>
              </Box>
            )}
          </Paper>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              This calculator uses the official Canadian tax brackets and rates.
              <br />
              API Server: <code>http://localhost:5001</code>
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
