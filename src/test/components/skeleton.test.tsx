import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  describe('Basic Rendering', () => {
    it('should render skeleton element', () => {
      render(<Skeleton data-testid="skeleton" />);

      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Skeleton />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render as div', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });
  });

  describe('Styling Classes', () => {
    it('should have bg-accent class', () => {
      render(<Skeleton />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('bg-accent');
    });

    it('should have animate-pulse class', () => {
      render(<Skeleton />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should have rounded-md class', () => {
      render(<Skeleton />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('rounded-md');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Skeleton className="custom-skeleton" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('custom-skeleton');
    });

    it('should merge custom className with default classes', () => {
      render(<Skeleton className="h-4 w-full" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('bg-accent');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-full');
    });

    it('should allow height override', () => {
      render(<Skeleton className="h-12" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-12');
    });

    it('should allow width override', () => {
      render(<Skeleton className="w-48" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-48');
    });

    it('should allow rounded override', () => {
      render(<Skeleton className="rounded-full" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('rounded-full');
    });
  });

  describe('Use Cases', () => {
    it('should work as text line skeleton', () => {
      render(<Skeleton className="h-4 w-[250px]" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-[250px]');
    });

    it('should work as avatar skeleton', () => {
      render(<Skeleton className="h-12 w-12 rounded-full" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-12');
      expect(skeleton).toHaveClass('w-12');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should work as button skeleton', () => {
      render(<Skeleton className="h-10 w-24" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-24');
    });

    it('should work as card skeleton', () => {
      render(<Skeleton className="h-[125px] w-[250px]" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-[125px]');
      expect(skeleton).toHaveClass('w-[250px]');
    });

    it('should work as image skeleton', () => {
      render(<Skeleton className="h-48 w-full" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-48');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('Multiple Skeletons', () => {
    it('should render multiple skeletons', () => {
      render(
        <div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );

      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render skeleton composition', () => {
      render(
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="line1" />
            <Skeleton className="h-4 w-[200px]" data-testid="line2" />
          </div>
        </div>
      );

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByTestId('line1')).toBeInTheDocument();
      expect(screen.getByTestId('line2')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(<Skeleton data-testid="my-skeleton" />);

      expect(screen.getByTestId('my-skeleton')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Skeleton id="skeleton-1" />);

      expect(document.getElementById('skeleton-1')).toBeInTheDocument();
    });

    it('should forward aria-label', () => {
      render(<Skeleton aria-label="Loading content" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should forward aria-hidden', () => {
      render(<Skeleton aria-hidden="true" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should forward role', () => {
      render(<Skeleton role="status" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Skeleton List Pattern', () => {
    it('should render skeleton list', () => {
      render(
        <ul>
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <Skeleton className="h-4 w-full mb-2" data-testid={`item-${i}`} />
            </li>
          ))}
        </ul>
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });
  });

  describe('Card Skeleton Pattern', () => {
    it('should render card skeleton', () => {
      render(
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" data-testid="image" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" data-testid="title" />
            <Skeleton className="h-4 w-[80%]" data-testid="description" />
          </div>
        </div>
      );

      expect(screen.getByTestId('image')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });
  });

  describe('Table Skeleton Pattern', () => {
    it('should render table skeleton', () => {
      render(
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" data-testid="header" />
          <Skeleton className="h-6 w-full" data-testid="row-1" />
          <Skeleton className="h-6 w-full" data-testid="row-2" />
          <Skeleton className="h-6 w-full" data-testid="row-3" />
        </div>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
      expect(screen.getByTestId('row-3')).toBeInTheDocument();
    });
  });

  describe('Form Skeleton Pattern', () => {
    it('should render form skeleton', () => {
      render(
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" data-testid="label" />
            <Skeleton className="h-10 w-full" data-testid="input" />
          </div>
          <Skeleton className="h-10 w-24" data-testid="button" />
        </div>
      );

      expect(screen.getByTestId('label')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Responsive Skeleton', () => {
    it('should accept responsive width classes', () => {
      render(<Skeleton className="w-full md:w-1/2 lg:w-1/3" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('md:w-1/2');
      expect(skeleton).toHaveClass('lg:w-1/3');
    });

    it('should accept responsive height classes', () => {
      render(<Skeleton className="h-24 md:h-32 lg:h-48" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-24');
      expect(skeleton).toHaveClass('md:h-32');
      expect(skeleton).toHaveClass('lg:h-48');
    });
  });

  describe('Style Variations', () => {
    it('should allow custom background override', () => {
      render(<Skeleton className="bg-gray-200" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('bg-gray-200');
    });

    it('should allow animation override', () => {
      render(<Skeleton className="animate-none" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('animate-none');
    });

    it('should allow border addition', () => {
      render(<Skeleton className="border border-gray-300" />);

      const skeleton = document.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('border');
      expect(skeleton).toHaveClass('border-gray-300');
    });
  });
});
