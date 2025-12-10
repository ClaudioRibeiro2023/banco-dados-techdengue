'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Application error:', error);

    // TODO: Send to error tracking service (Sentry)
    // if (ANALYTICS_CONFIG.sentry.enabled) {
    //   Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h1>
          <p className="text-muted-foreground mb-2">
            Ocorreu um erro inesperado ao processar sua solicitação.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Nossa equipe foi notificada e está trabalhando para resolver o problema.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Detalhes do erro
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-40">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Button onClick={() => (window.location.href = '/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Ir para o Dashboard
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Se o problema persistir,{' '}
            <a href="mailto:suporte@techdengue.com" className="text-primary hover:underline">
              entre em contato com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
