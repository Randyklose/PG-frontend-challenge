# Tax Calculator Application

A modern React TypeScript application that calculates Canadian income tax using marginal tax rates. Built as a technical interview challenge with production-ready patterns and comprehensive testing.

## 🚀 Features

- **Tax Calculation**: Calculate total income tax, effective tax rate, and breakdown by tax brackets
- **Modern UI**: Clean, responsive interface built with Material-UI
- **Data Fetching**: Efficient data fetching with SWR for caching and revalidation
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Form Validation**: Real-time form validation with user-friendly error messages
- **Logging**: Structured logging for debugging and monitoring
- **Testing**: Comprehensive unit and integration tests
- **TypeScript**: Full type safety throughout the application

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Library**: Material-UI (MUI)
- **Testing**: Vitest, React Testing Library
- **Styling**: Material-UI + CSS
- **API**: Dockerized mock API server

## 📦 Project Structure

```
src/
├── components/          # React components
│   ├── ErrorDisplay.tsx      # Error display with retry functionality
│   ├── LoadingSpinner.tsx    # Loading indicator
│   ├── TaxCalculationResults.tsx  # Tax results display
│   └── TaxCalculatorForm.tsx      # Main form component
├── hooks/              # Custom React hooks
│   └── useTaxCalculation.ts  # SWR hook for tax calculation
├── services/           # Business logic and external services
│   ├── logger.ts            # Structured logging service
│   └── taxApi.ts           # Tax API service with retry logic
├── theme/             # Material-UI theme configuration
│   └── theme.ts
├── types/             # TypeScript type definitions
│   └── tax.ts
└── App.tsx            # Main application component
```

## 🏗 Architecture & Design Patterns

### Service Layer Pattern
- `TaxApiService`: Encapsulates all API communication
- Retry logic with exponential backoff
- Custom error types for better error handling

### Custom Hooks Pattern
- `useTaxCalculation`: Manages tax calculation state with SWR
- Separates data fetching logic from UI components

### Error Handling Strategy
- Custom `TaxApiError` class with retry information
- User-friendly error messages
- Automatic retry for transient errors
- Manual retry options for users

### State Management
- Local component state for form data
- Centralized error and loading states

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker (for the API server)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the API server**:
   ```bash
   docker run --init -p 5001:5001 -it ptsdocker16/interview-test-server
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🧪 Testing

The application includes comprehensive testing:

### Unit Tests
- Component rendering and interaction
- Custom hooks functionality
- API service error handling
- Form validation logic

### Integration Tests
- Complete user workflows
- API integration with mock server
- Error boundary testing

### Test Coverage
Run `npm run test:coverage` to generate a coverage report.

## 🔧 Configuration

### API Endpoints
- `GET /tax-calculator/tax-year/{year}` - Fetch tax brackets for a given year
- Supported years: 2019, 2020, 2021, 2022

## 📊 API Response Format

### Tax Brackets Response
```typescript
{
  tax_brackets: [
    {
      min: number,      // Minimum income for bracket
      max?: number,     // Maximum income for bracket (optional for highest bracket)
      rate: number      // Tax rate as decimal (e.g., 0.15 for 15%)
    }
  ]
}
```

### Error Response
```typescript
{
  message: string,    // Error description
  code?: string,      // Error code
  status?: number     // HTTP status code
}
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Clear feedback during API calls
- **Error States**: User-friendly error messages with retry options
- **Form Validation**: Real-time validation with helpful error messages
- **Currency Formatting**: Canadian dollar formatting for all monetary values

## 🔒 Error Handling

### Error Types
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid input data
- **API Errors**: Server errors, unsupported tax years
- **Application Errors**: Unexpected runtime errors

### Retry Strategy
- Automatic retry for transient errors (network, server errors)
- Exponential backoff to prevent overwhelming the server
- Manual retry options for users
- Maximum retry limits to prevent infinite loops

## 🚀 Production Considerations

### Performance
- **Code Splitting**: Vite automatically splits code for optimal loading
- **Bundle Size**: Tree-shaking and dead code elimination

### Security
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: React's built-in XSS protection
- **Type Safety**: TypeScript prevents many runtime errors

### Monitoring
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Error Tracking**: Comprehensive error information for debugging
- **Performance Metrics**: Built-in React DevTools support


## 📝 License

This project is part of a technical interview challenge.

## 🐛 Known Issues

- Some test cases may fail due to timing issues with the mock API
- The application requires the Docker API server to be running

## 🔮 Future Enhancements

- **Multiple Tax Jurisdictions**: Support for provincial tax calculations
- **Tax Planning**: Year-over-year comparison tools
- **Export Features**: PDF export of tax calculations
- **Dark Mode**: Theme switching capability
- **Progressive Web App**: Offline functionality
- **Internationalization**: Multi-language support
- **Visual Regression testing**: Add Storybook support