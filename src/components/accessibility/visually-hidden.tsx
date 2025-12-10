'use client';

import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';

type VisuallyHiddenProps<T extends ElementType = 'span'> = {
  children: ReactNode;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'as'>;

export function VisuallyHidden<T extends ElementType = 'span'>({
  children,
  as,
  ...props
}: VisuallyHiddenProps<T>) {
  const Component = as || 'span';
  return (
    <Component className="sr-only" {...props}>
      {children}
    </Component>
  );
}
