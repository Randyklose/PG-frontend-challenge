import React, { useState, FormEvent } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Grid,
  Typography,
} from '@mui/material';
import { TaxCalculationRequest } from '../../types/tax';

interface TaxCalculatorFormProps {
  onSubmit: (request: TaxCalculationRequest) => void;
  isLoading: boolean;
}

export const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TaxCalculationRequest>({
    annualIncome: 0,
    taxYear: 2022,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate annual income
    if (!formData.annualIncome || formData.annualIncome <= 0) {
      newErrors.annualIncome = 'Annual income must be greater than 0';
    }

    // Validate tax year
    const validYears = [2019, 2020, 2021, 2022];
    if (!validYears.includes(formData.taxYear)) {
      newErrors.taxYear = 'Tax year must be 2019, 2020, 2021, or 2022';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof TaxCalculationRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            id="annualIncome"
            label="Annual Income ($)"
            type="number"
            value={formData.annualIncome || ''}
            onChange={(e) => handleInputChange('annualIncome', Number(e.target.value))}
            error={!!errors.annualIncome}
            helperText={errors.annualIncome}
            placeholder="Enter your annual income"
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!errors.taxYear}>
            <InputLabel id="tax-year-label">Tax Year</InputLabel>
            <Select
              labelId="tax-year-label"
              id="taxYear"
              value={formData.taxYear}
              onChange={(e) => handleInputChange('taxYear', Number(e.target.value))}
              label="Tax Year"
              disabled={isLoading}
            >
              <MenuItem value={2019}>2019</MenuItem>
              <MenuItem value={2020}>2020</MenuItem>
              <MenuItem value={2021}>2021</MenuItem>
              <MenuItem value={2022}>2022</MenuItem>
            </Select>
            {errors.taxYear && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.taxYear}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Box textAlign="center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ minWidth: 200 }}
            >
              {isLoading ? 'Calculating...' : 'Calculate Tax'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

