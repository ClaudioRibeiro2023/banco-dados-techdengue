'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry)
    // if (ANALYTICS_CONFIG.sentry.enabled) {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/dashboard';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h1>
                <p className="text-muted-foreground mb-6">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="w-full mb-6 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-40">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 flex-wrap justify-center">
                  <Button variant="outline" onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleReload}>
                    Recarregar página
                  </Button>
                  <Button onClick={this.handleGoHome}>
                    <Home className="h-4 w-4 mr-2" />
                    Ir para início
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
