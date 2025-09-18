import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxCalculationResults } from './TaxCalculationResults';
import { TaxCalculationResult } from '../../types/tax';

describe('TaxCalculationResults', () => {
  const mockResult: TaxCalculationResult = {
    totalTax: 17739.17,
    effectiveRate: 0.1774,
    taxPerBracket: [
      {
        bracket: { min: 0, max: 50197, rate: 0.15 },
        taxableAmount: 50197,
        taxAmount: 7529.55
      },
      {
        bracket: { min: 50197, max: 100392, rate: 0.205 },
        taxableAmount: 49803,
        taxAmount: 10209.62
      }
    ]
  };

  it('renders calculation results correctly', () => {
    render(
      <TaxCalculationResults
        result={mockResult}
        annualIncome={100000}
        taxYear={2022}
      />
    );

    expect(screen.getByText('Tax Calculation Results')).toBeInTheDocument();
    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('$17,739.17')).toBeInTheDocument();
    expect(screen.getByText('17.74%')).toBeInTheDocument();
  });

  it('renders tax breakdown table', () => {
    render(
      <TaxCalculationResults
        result={mockResult}
        annualIncome={100000}
        taxYear={2022}
      />
    );

    expect(screen.getByText('Tax Breakdown by Bracket')).toBeInTheDocument();
    expect(screen.getByText('Bracket Range')).toBeInTheDocument();
    expect(screen.getByText('Tax Rate')).toBeInTheDocument();
    expect(screen.getByText('Taxable Amount')).toBeInTheDocument();
    expect(screen.getByText('Tax Amount')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <TaxCalculationResults
        result={mockResult}
        annualIncome={100000}
        taxYear={2022}
      />
    );

    // Check for Canadian currency formatting
    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    expect(screen.getByText('$17,739.17')).toBeInTheDocument();
    expect(screen.getByText('$0.00 - $50,197.00')).toBeInTheDocument();
  });

  it('formats percentages correctly', () => {
    render(
      <TaxCalculationResults
        result={mockResult}
        annualIncome={100000}
        taxYear={2022}
      />
    );

    expect(screen.getByText('17.74%')).toBeInTheDocument();
    expect(screen.getByText('15.00%')).toBeInTheDocument();
    expect(screen.getByText('20.50%')).toBeInTheDocument();
  });

  it('handles zero income correctly', () => {
    const zeroResult: TaxCalculationResult = {
      totalTax: 0,
      effectiveRate: 0,
      taxPerBracket: []
    };

    render(
      <TaxCalculationResults
        result={zeroResult}
        annualIncome={0}
        taxYear={2022}
      />
    );

    // Check for multiple $0.00 values (annual income and total tax)
    expect(screen.getAllByText('$0.00')).toHaveLength(2);
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });
});

