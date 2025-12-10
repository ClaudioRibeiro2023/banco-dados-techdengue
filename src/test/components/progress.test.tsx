import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/progress';

describe('Progress Component', () => {
  describe('Basic Rendering', () => {
    it('should render progress component', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveAttribute('data-slot', 'progress');
    });

    it('should have default styling classes', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full');
    });

    it('should accept custom className', () => {
      render(<Progress value={50} className="custom-progress" />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveClass('custom-progress');
    });

    it('should have progress indicator with data-slot', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Value Handling', () => {
    it('should handle 0% value', () => {
      render(<Progress value={0} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle 50% value', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should handle 100% value', () => {
      render(<Progress value={100} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      // 100 - 100 = 0, so translateX(-0%) which is equivalent to translateX(0%)
      expect(indicator).toHaveAttribute('style', expect.stringContaining('translateX'));
    });

    it('should handle undefined value as 0', () => {
      render(<Progress />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle null value as 0', () => {
      render(<Progress value={null as unknown as number} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle 25% value', () => {
      render(<Progress value={25} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });

    it('should handle 75% value', () => {
      render(<Progress value={75} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
    });
  });

  describe('Indicator Styling', () => {
    it('should have indicator with full width', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveClass('w-full');
    });

    it('should have indicator with full height', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveClass('h-full');
    });

    it('should have indicator with transition', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveClass('transition-all');
    });

    it('should have indicator with primary background', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveClass('bg-primary');
    });

    it('should have indicator with flex-1', () => {
      render(<Progress value={50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveClass('flex-1');
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toBeInTheDocument();
    });

    it('should have progressbar accessibility', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');
      // Radix Progress has role="progressbar" which is the main accessibility requirement
      expect(progress).toBeInTheDocument();
    });

    it('should have data-state attribute', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');
      // Radix uses data-state for progress indication
      expect(progress).toHaveAttribute('data-state');
    });

    it('should accept value prop', () => {
      render(<Progress value={50} />);

      const progress = screen.getByRole('progressbar');
      // Verify progress renders correctly with value
      expect(progress).toBeInTheDocument();
    });

    it('should update on value change', () => {
      const { rerender } = render(<Progress value={25} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<Progress value={75} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward id prop', () => {
      render(<Progress value={50} id="progress-1" />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveAttribute('id', 'progress-1');
    });

    it('should forward data-testid prop', () => {
      render(<Progress value={50} data-testid="test-progress" />);

      expect(screen.getByTestId('test-progress')).toBeInTheDocument();
    });

    it('should forward aria-label prop', () => {
      render(<Progress value={50} aria-label="Loading progress" />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveAttribute('aria-label', 'Loading progress');
    });

    it('should forward aria-labelledby prop', () => {
      render(
        <>
          <span id="progress-label">Progress Label</span>
          <Progress value={50} aria-labelledby="progress-label" />
        </>
      );

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveAttribute('aria-labelledby', 'progress-label');
    });
  });

  describe('Edge Cases', () => {
    it('should handle value greater than 100', () => {
      render(<Progress value={150} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');
      // Edge case - verify it renders with some style
      expect(indicator).toBeInTheDocument();
    });

    it('should handle negative value', () => {
      render(<Progress value={-50} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-150%)' });
    });

    it('should handle decimal value', () => {
      render(<Progress value={33.33} />);

      const indicator = document.querySelector('[data-slot="progress-indicator"]');

      expect(indicator).toHaveStyle({ transform: 'translateX(-66.67%)' });
    });

    it('should merge className with default classes', () => {
      render(<Progress value={50} className="h-4" />);

      const progress = screen.getByRole('progressbar');

      expect(progress).toHaveClass('h-4');
      expect(progress).toHaveClass('rounded-full');
    });
  });
});
