import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Check } from 'lucide-react';

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });

    it('should render as span element by default', () => {
      render(<Badge data-testid="badge">Test</Badge>);

      const badge = screen.getByTestId('badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default">Default</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).toHaveClass('text-primary-foreground');
    });

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-secondary');
      expect(badge).toHaveClass('text-secondary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('text-white');
    });

    it('should render outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-foreground');
    });

    it('should default to default variant when not specified', () => {
      render(<Badge>Default</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Styling Classes', () => {
    it('should have inline-flex class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should have items-center class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('items-center');
    });

    it('should have justify-center class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('justify-center');
    });

    it('should have rounded-full class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have border class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('border');
    });

    it('should have px-2 class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('px-2');
    });

    it('should have py-0.5 class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('py-0.5');
    });

    it('should have text-xs class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('text-xs');
    });

    it('should have font-medium class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('font-medium');
    });

    it('should have w-fit class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('w-fit');
    });

    it('should have whitespace-nowrap class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('whitespace-nowrap');
    });

    it('should have shrink-0 class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('shrink-0');
    });

    it('should have gap-1 class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('gap-1');
    });

    it('should have overflow-hidden class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('overflow-hidden');
    });
  });

  describe('Focus Styles', () => {
    it('should have focus-visible ring styles', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('focus-visible:ring-ring/50');
      expect(badge).toHaveClass('focus-visible:ring-[3px]');
    });
  });

  describe('Aria Invalid Styles', () => {
    it('should have aria-invalid styles', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('aria-invalid:border-destructive');
    });
  });

  describe('Transition', () => {
    it('should have transition class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('transition-[color,box-shadow]');
    });
  });

  describe('Icon Styling', () => {
    it('should have icon size class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('[&>svg]:size-3');
    });

    it('should have icon pointer-events class', () => {
      render(<Badge>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('[&>svg]:pointer-events-none');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should merge custom className with variant classes', () => {
      render(<Badge className="my-class" variant="secondary">Merged</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('my-class');
      expect(badge).toHaveClass('bg-secondary');
    });
  });

  describe('asChild Prop', () => {
    it('should render as child element when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/link">Link Badge</a>
        </Badge>
      );

      const link = screen.getByRole('link', { name: 'Link Badge' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/link');
    });

    it('should apply badge styles to child element', () => {
      render(
        <Badge asChild variant="outline">
          <a href="/test">Styled Link</a>
        </Badge>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-foreground');
    });
  });

  describe('With Icons', () => {
    it('should render badge with icon', () => {
      render(
        <Badge>
          <Check data-testid="check-icon" />
          Verified
        </Badge>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('should render icon-only badge', () => {
      render(
        <Badge>
          <Check data-testid="check-icon" />
        </Badge>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(<Badge data-testid="my-badge">Test</Badge>);

      expect(screen.getByTestId('my-badge')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Badge id="badge-1">Test</Badge>);

      expect(document.getElementById('badge-1')).toBeInTheDocument();
    });

    it('should forward aria-label', () => {
      render(<Badge aria-label="Status badge">Active</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('should forward role prop', () => {
      render(<Badge role="status">Loading</Badge>);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('badgeVariants Function', () => {
    it('should generate default variant classes', () => {
      const classes = badgeVariants({ variant: 'default' });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
    });

    it('should generate secondary variant classes', () => {
      const classes = badgeVariants({ variant: 'secondary' });

      expect(classes).toContain('bg-secondary');
      expect(classes).toContain('text-secondary-foreground');
    });

    it('should generate destructive variant classes', () => {
      const classes = badgeVariants({ variant: 'destructive' });

      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('text-white');
    });

    it('should generate outline variant classes', () => {
      const classes = badgeVariants({ variant: 'outline' });

      expect(classes).toContain('text-foreground');
    });

    it('should use default variant when not specified', () => {
      const classes = badgeVariants({});

      expect(classes).toContain('bg-primary');
    });
  });

  describe('Use Cases', () => {
    it('should work as status badge', () => {
      render(<Badge variant="default">Active</Badge>);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as notification count', () => {
      render(<Badge variant="destructive">99+</Badge>);

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should work as label tag', () => {
      render(<Badge variant="secondary">JavaScript</Badge>);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('should work as version indicator', () => {
      render(<Badge variant="outline">v2.0.0</Badge>);

      expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    });

    it('should work with multiple badges', () => {
      render(
        <div>
          <Badge variant="default">New</Badge>
          <Badge variant="secondary">Featured</Badge>
          <Badge variant="outline">Beta</Badge>
        </div>
      );

      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Featured')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render empty badge', () => {
      render(<Badge data-testid="empty-badge" />);

      expect(screen.getByTestId('empty-badge')).toBeInTheDocument();
    });

    it('should handle long text', () => {
      const longText = 'This is a very long badge text';
      render(<Badge>{longText}</Badge>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>{"Badge <test> & more"}</Badge>);

      expect(screen.getByText('Badge <test> & more')).toBeInTheDocument();
    });

    it('should handle undefined variant', () => {
      render(<Badge variant={undefined}>Test</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveClass('bg-primary');
    });

    it('should handle emoji content', () => {
      render(<Badge>🎉 New Feature</Badge>);

      expect(screen.getByText('🎉 New Feature')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with role status', () => {
      render(<Badge role="status">Loading</Badge>);

      expect(screen.getByRole('status')).toHaveTextContent('Loading');
    });

    it('should support aria-label', () => {
      render(<Badge aria-label="3 new notifications">3</Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toHaveAttribute('aria-label', '3 new notifications');
    });
  });
});
