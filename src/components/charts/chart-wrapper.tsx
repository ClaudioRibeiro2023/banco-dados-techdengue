'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartWrapperProps {
  title?: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  action?: ReactNode;
}

export function ChartWrapper({
  title,
  description,
  children,
  loading = false,
  className,
  action,
}: ChartWrapperProps) {
  // Simple wrapper without card when no title
  if (!title) {
    return loading ? (
      <div className="flex h-[300px] items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
