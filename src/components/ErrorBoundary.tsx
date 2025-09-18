import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error">
            Something went wrong
          </Typography>
          <Button onClick={this.handleReset} variant="contained" sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
