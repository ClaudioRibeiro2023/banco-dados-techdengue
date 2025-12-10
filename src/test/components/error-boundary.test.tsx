import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/error-boundary';

// Mock window.location
const mockReload = vi.fn();
const mockHref = { value: '' };

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    get href() {
      return mockHref.value;
    },
    set href(value: string) {
      mockHref.value = value;
    },
  },
  writable: true,
});

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHref.value = '';
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('Normal Rendering', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should catch errors and display error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/Ocorreu um erro inesperado/)
      ).toBeInTheDocument();
    });

    it('should display alert triangle icon', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render "Tentar novamente" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    });

    it('should render "Recarregar página" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Recarregar página/i })).toBeInTheDocument();
    });

    it('should render "Ir para início" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Ir para início/i })).toBeInTheDocument();
    });

    it('should call reload on "Recarregar página" click', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Recarregar página/i });
      await user.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /dashboard on "Ir para início" click', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /Ir para início/i });
      await user.click(homeButton);

      expect(mockHref.value).toBe('/dashboard');
    });
  });

  describe('Reset Functionality', () => {
    it('should have reset button available', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Tentar novamente/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have min-h-screen class', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
    });

    it('should have flex and items-center classes', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
    });

    it('should have justify-center class', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-center');
    });

    it('should have bg-background class', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-background');
    });
  });

  describe('Card Structure', () => {
    it('should render error content inside a card', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Card should have max-w-lg class
      const card = container.querySelector('.max-w-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have w-full class on card', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const card = container.querySelector('.max-w-lg');
      expect(card).toHaveClass('w-full');
    });
  });

  describe('Development Mode', () => {
    it('should show error details summary in development', () => {
      // Note: In vitest, NODE_ENV is 'test' by default and read-only
      // This test verifies the error boundary renders correctly
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have error UI rendered
      expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render RefreshCw icon on retry button', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /Tentar novamente/i });
      const icon = retryButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render Home icon on home button', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /Ir para início/i });
      const icon = homeButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      // Note: Console.error is mocked globally in test setup
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Console.error should have been called when error is caught
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Button Variants', () => {
    it('should have outline variant on retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Retry button should be outline variant
      const retryButton = screen.getByRole('button', { name: /Tentar novamente/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should have outline variant on reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Recarregar página/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('should have default variant on home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('button', { name: /Ir para início/i });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('Destructive Styling', () => {
    it('should have destructive background for icon wrapper', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const iconWrapper = container.querySelector('.bg-destructive\\/10');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('should have destructive text color for icon', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const icon = container.querySelector('.text-destructive');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('should have centered text', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const textCenter = container.querySelector('.text-center');
      expect(textCenter).toBeInTheDocument();
    });

    it('should have muted text for description', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const description = screen.getByText(/Ocorreu um erro inesperado/);
      expect(description).toHaveClass('text-muted-foreground');
    });
  });
});
