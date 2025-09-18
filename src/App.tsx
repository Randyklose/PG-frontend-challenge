import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TaxCalculatorStateManager } from './components/TaxCalculatorStateManager';
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
      <ErrorBoundary>
        <Box sx={{ 
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h1" component="h1" gutterBottom>
                  Tax Calculator
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Calculate your income tax using Canadian marginal tax rates
                </Typography>
              </Box>
              <Box textAlign="center" mb={4}>
                <TaxCalculatorStateManager
                  appState={appState}
                  result={result}
                  lastRequest={lastRequest}
                  error={error}
                  onSubmit={handleTaxCalculation}
                  onNewCalculation={handleNewCalculation}
                  onRetry={handleRetry}
                />
              </Box>
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
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
