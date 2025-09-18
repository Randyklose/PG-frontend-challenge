import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Collapse,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { TaxApiError } from '../services/taxApi/taxApi';

interface ErrorDisplayProps {
  error: TaxApiError | Error;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const getErrorMessage = (error: TaxApiError | Error): string => {
    if (error instanceof TaxApiError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Unable to connect to the tax API. Please ensure the API server is running on localhost:5001.';
        case 'INVALID_TAX_YEAR':
          return 'Invalid tax year. Please select 2019, 2020, 2021, or 2022.';
        case 'INVALID_INCOME':
          return 'Invalid income amount. Please enter a positive number.';
        case 'INVALID_RESPONSE':
          return 'The API returned an invalid response. Please try again.';
        case 'CALCULATION_ERROR':
          return 'An error occurred during tax calculation. Please try again.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }
    return error.message || 'An unexpected error occurred.';
  };

  const getErrorTitle = (error: TaxApiError | Error): string => {
    if (error instanceof TaxApiError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Connection Error';
        case 'INVALID_TAX_YEAR':
        case 'INVALID_INCOME':
          return 'Invalid Input';
        case 'INVALID_RESPONSE':
        case 'CALCULATION_ERROR':
          return 'API Error';
        default:
          return 'Error';
      }
    }
    return 'Error';
  };

  const isRetryable = (error: TaxApiError | Error): boolean => {
    if (error instanceof TaxApiError) {
      return error.retryable || ['NETWORK_ERROR', 'INVALID_RESPONSE', 'CALCULATION_ERROR'].includes(error.code || '');
    }
    return true;
  };

  const getSeverity = (error: TaxApiError | Error): 'error' | 'warning' => {
    if (error instanceof TaxApiError) {
      return ['INVALID_TAX_YEAR', 'INVALID_INCOME'].includes(error.code || '') ? 'warning' : 'error';
    }
    return 'error';
  };

  return (
    <Box>
      <Alert 
        severity={getSeverity(error)} 
        sx={{ mb: 2 }}
        action={
          isRetryable(error) && onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Try Again
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{getErrorTitle(error)}</AlertTitle>
        {getErrorMessage(error)}
        
        {error instanceof TaxApiError && error.status && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Status Code: {error.status}
          </Typography>
        )}
      </Alert>

      <Box>
        <Button
          onClick={() => setShowDetails(!showDetails)}
          endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
          size="small"
        >
          {showDetails ? 'Hide' : 'Show'} Help
        </Button>
        
        <Collapse in={showDetails}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <Typography variant="body2">
                  Ensure the API server is running: <code>docker run --init -p 5001:5001 -it ptsdocker16/interview-test-server</code>
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Check that you're using a supported tax year (2019-2022)
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Verify your income is a positive number
                </Typography>
              </li>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

