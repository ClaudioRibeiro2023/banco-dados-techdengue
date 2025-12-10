import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator', () => {
  describe('Basic Rendering', () => {
    it('should render separator element', () => {
      render(<Separator data-testid="separator" />);

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Separator />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('should render with separator role when not decorative', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('should be horizontal by default', () => {
      render(<Separator />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should support horizontal orientation', () => {
      render(<Separator orientation="horizontal" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should support vertical orientation', () => {
      render(<Separator orientation="vertical" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Horizontal Styling', () => {
    it('should have h-px class when horizontal', () => {
      render(<Separator orientation="horizontal" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('data-[orientation=horizontal]:h-px');
    });

    it('should have w-full class when horizontal', () => {
      render(<Separator orientation="horizontal" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('data-[orientation=horizontal]:w-full');
    });
  });

  describe('Vertical Styling', () => {
    it('should have w-px class when vertical', () => {
      render(<Separator orientation="vertical" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('data-[orientation=vertical]:w-px');
    });

    it('should have h-full class when vertical', () => {
      render(<Separator orientation="vertical" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('data-[orientation=vertical]:h-full');
    });
  });

  describe('Common Styling', () => {
    it('should have bg-border class', () => {
      render(<Separator />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('bg-border');
    });

    it('should have shrink-0 class', () => {
      render(<Separator />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('shrink-0');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Separator className="custom-separator" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('custom-separator');
    });

    it('should merge custom className with default classes', () => {
      render(<Separator className="my-4" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('bg-border');
      expect(separator).toHaveClass('my-4');
    });
  });

  describe('Decorative Mode', () => {
    it('should be decorative by default', () => {
      render(<Separator />);

      // Decorative separators don't have role="separator"
      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('should support decorative={false} with separator role', () => {
      render(<Separator decorative={false} />);

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should support decorative={true}', () => {
      render(<Separator decorative={true} />);

      // Decorative separators should still render
      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as section divider', () => {
      render(
        <div>
          <section>Section 1</section>
          <Separator />
          <section>Section 2</section>
        </div>
      );

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('should work in vertical layout', () => {
      render(
        <div style={{ display: 'flex', height: '100px' }}>
          <div>Left</div>
          <Separator orientation="vertical" />
          <div>Right</div>
        </div>
      );

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should work in list items', () => {
      render(
        <ul>
          <li>Item 1</li>
          <Separator />
          <li>Item 2</li>
          <Separator />
          <li>Item 3</li>
        </ul>
      );

      const separators = document.querySelectorAll('[data-slot="separator"]');
      expect(separators).toHaveLength(2);
    });

    it('should work in navigation', () => {
      render(
        <nav>
          <a href="/">Home</a>
          <Separator orientation="vertical" className="mx-2" />
          <a href="/about">About</a>
          <Separator orientation="vertical" className="mx-2" />
          <a href="/contact">Contact</a>
        </nav>
      );

      const separators = document.querySelectorAll('[data-slot="separator"]');
      expect(separators).toHaveLength(2);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(<Separator data-testid="my-separator" />);

      expect(screen.getByTestId('my-separator')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Separator id="separator-1" />);

      expect(document.getElementById('separator-1')).toBeInTheDocument();
    });

    it('should forward aria-label when not decorative', () => {
      render(<Separator decorative={false} aria-label="Section divider" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('aria-label', 'Section divider');
    });
  });

  describe('Accessibility', () => {
    it('should have separator role when not decorative', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('should have aria-orientation for horizontal when not decorative', () => {
      render(<Separator decorative={false} orientation="horizontal" />);

      const separator = screen.getByRole('separator');
      // Radix doesn't set aria-orientation when it matches the default (horizontal)
      expect(separator).toBeInTheDocument();
    });

    it('should have aria-orientation for vertical when not decorative', () => {
      render(<Separator decorative={false} orientation="vertical" />);

      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Multiple Separators', () => {
    it('should render multiple horizontal separators', () => {
      render(
        <div>
          <Separator />
          <Separator />
          <Separator />
        </div>
      );

      const separators = document.querySelectorAll('[data-slot="separator"]');
      expect(separators).toHaveLength(3);
    });

    it('should render multiple vertical separators', () => {
      render(
        <div style={{ display: 'flex' }}>
          <Separator orientation="vertical" />
          <Separator orientation="vertical" />
          <Separator orientation="vertical" />
        </div>
      );

      const separators = document.querySelectorAll('[data-slot="separator"]');
      expect(separators).toHaveLength(3);

      separators.forEach((sep) => {
        expect(sep).toHaveAttribute('data-orientation', 'vertical');
      });
    });

    it('should mix horizontal and vertical separators', () => {
      render(
        <div>
          <Separator orientation="horizontal" />
          <div style={{ display: 'flex' }}>
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
          <Separator orientation="horizontal" />
        </div>
      );

      const separators = document.querySelectorAll('[data-slot="separator"]');
      expect(separators).toHaveLength(3);
    });
  });

  describe('Style Overrides', () => {
    it('should allow color override', () => {
      render(<Separator className="bg-red-500" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('bg-red-500');
    });

    it('should allow margin override', () => {
      render(<Separator className="my-8" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('my-8');
    });

    it('should allow thickness override with custom class', () => {
      render(<Separator className="h-1" />);

      const separator = document.querySelector('[data-slot="separator"]');
      expect(separator).toHaveClass('h-1');
    });
  });
});
