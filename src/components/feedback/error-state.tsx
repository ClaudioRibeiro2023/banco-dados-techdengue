'use client';

import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ErrorType = 'generic' | 'network' | 'server' | 'notFound' | 'forbidden';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const errorConfig: Record<ErrorType, { icon: typeof AlertTriangle; title: string; description: string }> = {
  generic: {
    icon: AlertTriangle,
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Tente novamente.',
  },
  network: {
    icon: WifiOff,
    title: 'Sem conexão',
    description: 'Verifique sua conexão com a internet e tente novamente.',
  },
  server: {
    icon: ServerCrash,
    title: 'Erro no servidor',
    description: 'O servidor está temporariamente indisponível. Tente novamente em alguns minutos.',
  },
  notFound: {
    icon: FileX,
    title: 'Não encontrado',
    description: 'O recurso solicitado não foi encontrado.',
  },
  forbidden: {
    icon: AlertTriangle,
    title: 'Acesso negado',
    description: 'Você não tem permissão para acessar este recurso.',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive', className)}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title || config.title}</p>
          <p className="text-xs opacity-80 truncate">{description || config.description}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-destructive/20', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-destructive/10 mb-4">
          <Icon className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title || config.title}</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          {description || config.description}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="h-auto p-1">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
