import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

/**
 * Top-level error boundary. Catches any uncaught React render errors,
 * logs them, and shows a user-friendly recovery UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* In production this would send to a monitoring service (Dynatrace / AppInsights) */
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--color-fm-surface)' }}
      >
        <div
          className="w-full max-w-md rounded-xl p-8 text-center shadow-sm"
          style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-fm-border)' }}
        >
          {/* FM logo mark */}
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ backgroundColor: 'var(--color-fm-danger-bg)' }}
            aria-hidden="true"
          >
            <span style={{ color: 'var(--color-fm-danger)', fontSize: '1.5rem' }}>⚠</span>
          </div>

          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-fm-navy)' }}>
            Something went wrong
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-fm-muted)' }}>
            An unexpected error occurred. Our team has been notified.
            {this.state.error?.message && (
              <span className="block mt-2 font-mono text-xs break-words" style={{ color: 'var(--color-fm-danger)' }}>
                {this.state.error.message}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0073E6]"
              style={{ backgroundColor: 'var(--color-fm-navy)' }}
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0073E6]"
              style={{ borderColor: 'var(--color-fm-border)', color: 'var(--color-fm-navy)' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
