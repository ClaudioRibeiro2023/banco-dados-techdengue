'use client';

import { useRef, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/feedback';

export interface VirtualTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  maxHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

export function VirtualTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight = 52,
  maxHeight = 500,
  className,
  onRowClick,
  emptyMessage = 'Nenhum dado encontrado',
  stickyHeader = true,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  if (data.length === 0) {
    return <EmptyState type="data" description={emptyMessage} compact />;
  }

  return (
    <div className={cn('rounded-lg border overflow-hidden', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex border-b bg-muted/50 font-medium text-sm',
          stickyHeader && 'sticky top-0 z-10'
        )}
      >
        {columns.map((column) => (
          <div
            key={String(column.key)}
            className={cn(
              'px-4 py-3 flex-shrink-0',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right'
            )}
            style={{ width: column.width || 'auto', flex: column.width ? 'none' : '1' }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: maxHeight - rowHeight }}
      >
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {items.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  'absolute top-0 left-0 w-full flex border-b last:border-0 hover:bg-muted/30 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className={cn(
                      'px-4 flex items-center flex-shrink-0 text-sm',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                    style={{ width: column.width || 'auto', flex: column.width ? 'none' : '1' }}
                  >
                    {column.render
                      ? column.render(item, virtualRow.index)
                      : String(item[column.key as keyof T] ?? '')}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
