# Error Boundary System Documentation

## Overview

The Error Boundary System provides comprehensive error handling and recovery mechanisms for the AI Skills application. It includes multiple specialized error boundaries, hooks for functional components, and utilities for error recovery.

## Components

### Base ErrorBoundary

The foundation error boundary component with advanced features:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary
  componentName="MyComponent"
  onError={(error, errorInfo) => console.log(error)}
  onRetry={() => refetch()}
  onReset={() => resetState()}
  retryCount={3}
  maxRetries={5}
  showErrorDetails={true}
  errorType="boundary"
>
  <MyComponent />
</ErrorBoundary>
```

**Props:**
- `componentName`: Name for error tracking
- `onError`: Custom error handler
- `onRetry`: Retry callback
- `onReset`: Reset callback
- `retryCount`: Current retry count
- `maxRetries`: Maximum retry attempts
- `showErrorDetails`: Show debug info in development
- `errorType`: Error severity level

### Specialized Error Boundaries

#### AppErrorBoundary
Top-level application error boundary for critical errors:

```tsx
import { AppErrorBoundary } from '@/components/ui/error-boundary';

<AppErrorBoundary>
  <App />
</AppErrorBoundary>
```

#### RouteErrorBoundary
Page-level error boundary for route errors:

```tsx
import { RouteErrorBoundary } from '@/components/ui/error-boundary';

<RouteErrorBoundary>
  <PageComponent />
</RouteErrorBoundary>
```

#### ComponentErrorBoundary
Component-level error boundary for UI errors:

```tsx
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';

<ComponentErrorBoundary>
  <Widget />
</ComponentErrorBoundary>
```

#### Feature-Specific Boundaries

- `LessonErrorBoundary`: For lesson-related errors
- `ProjectErrorBoundary`: For project-related errors
- `AuthErrorBoundary`: For authentication errors

## Hooks

### useErrorBoundary

Hook for functional components:

```tsx
import { useErrorBoundary } from '@/components/ui/error-boundary';

function MyComponent() {
  const { error, resetError, ErrorFallback } = useErrorBoundary('MyComponent');

  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  return <div>My component</div>;
}
```

### useErrorBoundaryContext

Context hook for error tracking:

```tsx
import { useErrorBoundaryContext } from '@/components/ui/error-boundary';

function ErrorTracker() {
  const { reportError, hasErrors, errorCount } = useErrorBoundaryContext();
  
  return (
    <div>
      Errors: {errorCount}
      {hasErrors && <span>⚠️</span>}
    </div>
  );
}
```

## Providers

### ErrorBoundaryProvider

Context provider for error management:

```tsx
import { ErrorBoundaryProvider } from '@/components/ui/error-boundary';

<ErrorBoundaryProvider onError={(error, errorInfo) => {
  // Log to external service
  analytics.track('error', { error, errorInfo });
}}>
  <App />
</ErrorBoundaryProvider>
```

## Utilities

### ErrorRecoveryUtils

Utility functions for error recovery:

```tsx
import { ErrorRecoveryUtils } from '@/components/ui/error-boundary';

// Check if error is recoverable
const isRecoverable = ErrorRecoveryUtils.isRecoverable(error);

// Get recovery strategy
const strategy = ErrorRecoveryUtils.getRecoveryStrategy(error);

// Calculate retry delay
const delay = ErrorRecoveryUtils.getRetryDelay(attempt);

// Check if error should be reported
const shouldReport = ErrorRecoveryUtils.shouldReportError(error);
```

## Error Types

### errorType Values

- `"boundary"`: Standard error boundary (default)
- `"fallback"`: Lightweight fallback UI
- `"critical"`: Critical application error

### Recovery Strategies

- `"retry"`: Retry the operation
- `"reset"`: Reset component state
- `"redirect"`: Navigate to different page
- `"none"`: No recovery action

## Integration Examples

### Basic Integration

```tsx
import { RouteErrorBoundary } from '@/components/ui/error-boundary';

function MyPage() {
  return (
    <RouteErrorBoundary>
      <div>Page content</div>
    </RouteErrorBoundary>
  );
}
```

### Advanced Integration

```tsx
import { 
  ErrorBoundaryProvider, 
  AppErrorBoundary,
  useErrorBoundary 
} from '@/components/ui/error-boundary';

function App() {
  return (
    <ErrorBoundaryProvider onError={handleGlobalError}>
      <AppErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </AppErrorBoundary>
    </ErrorBoundaryProvider>
  );
}

function HomePage() {
  const { error, resetError, ErrorFallback } = useErrorBoundary('HomePage');
  
  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }
  
  return <div>Home page content</div>;
}
```

### Custom Fallback

```tsx
function CustomErrorFallback({ error, resetError }) {
  return (
    <div className="error-container">
      <h2>Oops! Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try Again</button>
    </div>
  );
}

<ErrorBoundary fallback={<CustomErrorFallback />}>
  <Component />
</ErrorBoundary>
```

## Error Recovery Features

### Automatic Recovery

- Exponential backoff retry logic
- Automatic error reporting
- Error categorization and severity levels
- Recovery strategy determination

### Manual Recovery

- Retry button with attempt tracking
- Reset functionality
- Navigation options (Home, Back, Settings)
- Custom recovery callbacks

### Error Tracking

- Error ID generation
- Breadcrumb tracking
- Component stack traces
- Error metadata collection

## Best Practices

### 1. Use Appropriate Boundary Types

- Use `AppErrorBoundary` for critical app errors
- Use `RouteErrorBoundary` for page-level errors
- Use `ComponentErrorBoundary` for widget errors
- Use feature-specific boundaries for domain errors

### 2. Implement Proper Error Handling

```tsx
// Good: Handle specific error types
<LessonErrorBoundary onError={(error) => {
  if (error.name === 'NetworkError') {
    // Handle network errors
  } else if (error.name === 'ValidationError') {
    // Handle validation errors
  }
}}>
  <LessonComponent />
</LessonErrorBoundary>
```

### 3. Provide Meaningful Fallbacks

```tsx
// Good: Contextual error messages
<ProjectErrorBoundary fallback={
  <div>
    <h3>Project Error</h3>
    <p>Your work has been saved automatically.</p>
    <button>Continue from last save</button>
  </div>
}>
  <ProjectEditor />
</ProjectErrorBoundary>
```

### 4. Monitor Error Patterns

```tsx
// Track error patterns for debugging
<ErrorBoundaryProvider onError={(error, errorInfo) => {
  analytics.track('error_boundary', {
    component: errorInfo.componentStack,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
}}>
  <App />
</ErrorBoundaryProvider>
```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

test('renders error UI when error occurs', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
test('handles retry functionality', async () => {
  const onRetry = vi.fn();
  
  render(
    <ErrorBoundary onRetry={onRetry}>
      <ThrowError />
    </ErrorBoundary>
  );

  fireEvent.click(screen.getByText('Try Again'));
  expect(onRetry).toHaveBeenCalled();
});
```

## Configuration

### Environment Variables

```env
# Enable detailed error reporting in development
NODE_ENV=development

# Error reporting endpoint
VITE_ERROR_REPORTING_ENDPOINT=https://errors.example.com

# Error monitoring service
VITE_ERROR_MONITORING_SERVICE=sentry
```

### Monitoring Service Integration

```tsx
// Configure error reporting
import { reportError } from '@/services/monitoringService';

<ErrorBoundaryProvider onError={(error, errorInfo) => {
  reportError({
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    tags: ['react', 'error-boundary'],
  });
}}>
  <App />
</ErrorBoundaryProvider>
```

## Troubleshooting

### Common Issues

1. **Error boundaries not catching errors**
   - Ensure error boundaries are placed correctly in component tree
   - Check that errors are thrown in render or lifecycle methods

2. **Infinite retry loops**
   - Set appropriate `maxRetries` limit
   - Implement proper error recovery logic

3. **Missing error context**
   - Provide `componentName` for better error tracking
   - Use `showErrorDetails` in development mode

### Debug Mode

Enable debug mode for detailed error information:

```tsx
<ErrorBoundary showErrorDetails={true}>
  <Component />
</ErrorBoundary>
```

This will show:
- Error message and stack trace
- Component stack information
- Retry count and recovery attempts
- Error ID for tracking 