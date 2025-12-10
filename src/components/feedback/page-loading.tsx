'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ message = 'Carregando...', className }: PageLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] gap-4',
        className
      )}
    >
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
        <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-lg font-medium animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}

export function SpinnerLoading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />;
}

export function ButtonLoading({ children }: { children?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {children || 'Aguarde...'}
    </span>
  );
}
