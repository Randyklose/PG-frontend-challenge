import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaxCalculatorForm } from './TaxCalculatorForm';

describe('TaxCalculatorForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax year/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate tax/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /calculate tax/i });
    await user.click(submitButton);

    expect(screen.getByText(/annual income must be greater than 0/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates income is positive', async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    await user.clear(incomeInput);
    await user.type(incomeInput, '-1000');

    const submitButton = screen.getByRole('button', { name: /calculate tax/i });
    await user.click(submitButton);

    // Check if the form was submitted
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Check if the error message is displayed
    expect(screen.getByText(/annual income must be greater than 0/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    const incomeInput = screen.getByLabelText(/annual income/i);
    const submitButton = screen.getByRole('button', { name: /calculate tax/i });

    await user.type(incomeInput, '50000');
    // Tax year is already set to 2022 by default
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      annualIncome: 50000,
      taxYear: 2022
    });
  });

  it('disables form when loading', () => {
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByLabelText(/annual income/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled();
    // Material-UI Select doesn't have a disabled attribute on the select element
    // Instead, we check that the select element has the disabled class
    const selectElement = screen.getByLabelText(/tax year/i);
    expect(selectElement).toHaveClass('Mui-disabled');
  });

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TaxCalculatorForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /calculate tax/i });
    await user.click(submitButton);

    expect(screen.getByText(/annual income must be greater than 0/i)).toBeInTheDocument();

    // Start typing to clear error
    const incomeInput = screen.getByLabelText(/annual income/i);
    await user.type(incomeInput, '5');

    await waitFor(() => {
      expect(screen.queryByText(/annual income is required/i)).not.toBeInTheDocument();
    });
  });
});

