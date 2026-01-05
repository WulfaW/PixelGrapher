import { Component, ReactNode } from 'react';
import ErrorPage from './ErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ info: info?.componentStack });
    // Future: send to monitoring service (Sentry / Log API)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} info={this.state.info} onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
