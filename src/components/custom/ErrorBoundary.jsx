import React from 'react';
import { Button } from '../ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Customize your fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <img src="/logo.svg" alt="Logo" className="mb-8 h-16 w-16" />
          <h1 className="text-4xl font-bold text-red-600 mb-2">Oops! Something went wrong</h1>
          <p className="mb-8 text-lg text-gray-600">
            We're sorry for the inconvenience. Please try again or go back to the home page.
          </p>
          {this.state.error && (
            <div className="mb-8 max-w-2xl rounded-md bg-gray-100 p-4 text-left">
              <p className="mb-2 font-semibold">Error details:</p>
              <p className="text-sm text-red-600">{this.state.error.toString()}</p>
            </div>
          )}
          <div className="flex space-x-4">
            <Button variant="outline" onClick={this.handleReload}>
              Try Again
            </Button>
            <Button onClick={this.handleGoHome}>
              Go to Home Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 