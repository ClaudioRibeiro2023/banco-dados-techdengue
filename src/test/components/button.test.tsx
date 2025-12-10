import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from '@/components/ui/button';
import { Mail } from 'lucide-react';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('should render as button element by default', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('text-white');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-background');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
    });

    it('should render sm size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
    });

    it('should render lg size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-6');
    });

    it('should render icon size', () => {
      render(<Button size="icon"><Mail /></Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-9');
    });

    it('should render icon-sm size', () => {
      render(<Button size="icon-sm"><Mail /></Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-8');
    });

    it('should render icon-lg size', () => {
      render(<Button size="icon-lg"><Mail /></Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-10');
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have disabled styling classes', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button disabled onClick={onClick}>Disabled</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should receive click event', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Click</Button>);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('asChild Prop', () => {
    it('should render as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply button styles to child element', () => {
      render(
        <Button asChild variant="outline">
          <a href="/test">Styled Link</a>
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('border');
      expect(link).toHaveClass('bg-background');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-button">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });

    it('should merge custom className with default classes', () => {
      render(<Button className="my-custom-class">Merged</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
    });
  });

  describe('With Icons', () => {
    it('should render button with icon', () => {
      render(
        <Button>
          <Mail data-testid="mail-icon" />
          Send Email
        </Button>
      );

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Send Email');
    });

    it('should have icon sizing classes', () => {
      render(<Button><Mail /></Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('[&_svg:not([class*=\'size-\'])]:size-4');
    });
  });

  describe('Styling Classes', () => {
    it('should have inline-flex class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('inline-flex');
    });

    it('should have items-center class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('items-center');
    });

    it('should have justify-center class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('justify-center');
    });

    it('should have rounded-md class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('rounded-md');
    });

    it('should have transition-all class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('transition-all');
    });

    it('should have font-medium class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('font-medium');
    });

    it('should have text-sm class', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('text-sm');
    });
  });

  describe('Focus Styles', () => {
    it('should have focus-visible ring styles', () => {
      render(<Button>Focus</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-ring/50');
      expect(button).toHaveClass('focus-visible:ring-[3px]');
    });

    it('should have outline-none class', () => {
      render(<Button>Focus</Button>);

      expect(screen.getByRole('button')).toHaveClass('outline-none');
    });
  });

  describe('Aria Invalid Styles', () => {
    it('should have aria-invalid styles', () => {
      render(<Button aria-invalid="true">Invalid</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('aria-invalid:border-destructive');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward type prop', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should forward data-testid', () => {
      render(<Button data-testid="my-button">Test</Button>);

      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Button id="button-1">Test</Button>);

      expect(document.getElementById('button-1')).toBeInTheDocument();
    });

    it('should forward aria-label', () => {
      render(<Button aria-label="Custom label"><Mail /></Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should forward aria-pressed', () => {
      render(<Button aria-pressed="true">Toggle</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('buttonVariants Function', () => {
    it('should generate default variant classes', () => {
      const classes = buttonVariants({ variant: 'default' });

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
    });

    it('should generate destructive variant classes', () => {
      const classes = buttonVariants({ variant: 'destructive' });

      expect(classes).toContain('bg-destructive');
    });

    it('should generate size classes', () => {
      const classes = buttonVariants({ size: 'lg' });

      expect(classes).toContain('h-10');
      expect(classes).toContain('px-6');
    });

    it('should combine variant and size classes', () => {
      const classes = buttonVariants({ variant: 'outline', size: 'sm' });

      expect(classes).toContain('border');
      expect(classes).toContain('h-8');
    });

    it('should include custom className', () => {
      const classes = buttonVariants({ className: 'custom-class' });

      expect(classes).toContain('custom-class');
    });
  });

  describe('Keyboard Interaction', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();

      render(<Button>Focusable</Button>);

      await user.tab();

      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('should trigger onClick on Enter key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Enter</Button>);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick on Space key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Button onClick={onClick}>Space</Button>);

      await user.tab();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should render empty button', () => {
      render(<Button />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render button with multiple children', () => {
      render(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      );

      expect(screen.getByRole('button')).toHaveTextContent('FirstSecond');
    });

    it('should handle undefined variant', () => {
      render(<Button variant={undefined}>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should handle undefined size', () => {
      render(<Button size={undefined}>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });
  });
});
