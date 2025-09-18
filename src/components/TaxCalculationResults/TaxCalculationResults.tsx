import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import { TaxCalculationResult } from '../../types/tax';

interface TaxCalculationResultsProps {
  result: TaxCalculationResult;
  annualIncome: number;
  taxYear: number;
}

export const TaxCalculationResults: React.FC<TaxCalculationResultsProps> = ({
  result,
  annualIncome,
  taxYear,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <Box>
      <Typography variant="h2" component="h2" gutterBottom textAlign="center">
        Tax Calculation Results
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Annual Income
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(annualIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tax Year
              </Typography>
              <Typography variant="h4" component="div">
                {taxYear}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Tax Owed
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(result.totalTax)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Effective Tax Rate
              </Typography>
              <Typography variant="h4" component="div">
                {formatPercentage(result.effectiveRate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h3" component="h3" gutterBottom>
          Tax Breakdown by Bracket
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Bracket Range</strong></TableCell>
                <TableCell align="right"><strong>Tax Rate</strong></TableCell>
                <TableCell align="right"><strong>Taxable Amount</strong></TableCell>
                <TableCell align="right"><strong>Tax Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.taxPerBracket.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {formatCurrency(item.bracket.min)} - {item.bracket.max ? formatCurrency(item.bracket.max) : '∞'}
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={formatPercentage(item.bracket.rate)} 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.taxableAmount)}
                  </TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(item.taxAmount)}</strong>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

