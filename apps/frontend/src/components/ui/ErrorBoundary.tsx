import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon } from './Icons';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log exception safely for diagnostics without exposing to citizen DOM
    console.error('[BenefitOS ErrorBoundary caught exception]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-screen bg-[#080C0A] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 selection:bg-mint-500 selection:text-forest-950"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-900/80 flex items-center justify-center text-rose-400 mx-auto shadow-sm">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-lg sm:text-xl font-bold text-white font-heading">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The application encountered an unexpected issue while rendering this view. Your saved citizen profile and application records remain safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={this.handleReload}
              >
                Reload BenefitOS
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={this.handleReset}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
