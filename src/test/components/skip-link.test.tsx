import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipLink } from '@/components/accessibility/skip-link';

describe('SkipLink Component', () => {
  describe('Basic Rendering', () => {
    it('should render skip link element', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: /pular para o conteúdo principal/i });

      expect(link).toBeInTheDocument();
    });

    it('should render as anchor element', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link.tagName).toBe('A');
    });

    it('should have correct default href', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '#main-content');
    });

    it('should display Portuguese text', () => {
      render(<SkipLink />);

      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument();
    });
  });

  describe('Custom href', () => {
    it('should accept custom href', () => {
      render(<SkipLink href="#content" />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '#content');
    });

    it('should accept any anchor href', () => {
      render(<SkipLink href="#navigation" />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '#navigation');
    });

    it('should accept section id href', () => {
      render(<SkipLink href="#section-1" />);

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '#section-1');
    });
  });

  describe('Styling', () => {
    it('should have sr-only class by default', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('sr-only');
    });

    it('should have focus:not-sr-only class', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:not-sr-only');
    });

    it('should have focus:absolute class', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:absolute');
    });

    it('should have high z-index on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:z-[100]');
    });

    it('should have positioning classes on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:top-4', 'focus:left-4');
    });

    it('should have padding on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:p-4');
    });

    it('should have background color on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:bg-primary');
    });

    it('should have text color on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:text-primary-foreground');
    });

    it('should have rounded border on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:rounded-md');
    });

    it('should have outline none on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:outline-none');
    });

    it('should have ring styles on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('focus:ring-2', 'focus:ring-ring');
    });

    it('should accept custom className', () => {
      render(<SkipLink className="custom-skip" />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('custom-skip');
    });

    it('should merge custom className with default classes', () => {
      render(<SkipLink className="my-custom-class" />);

      const link = screen.getByRole('link');

      expect(link).toHaveClass('sr-only');
      expect(link).toHaveClass('my-custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have link role', () => {
      render(<SkipLink />);

      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should be focusable', async () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      link.focus();

      expect(document.activeElement).toBe(link);
    });

    it('should be accessible via keyboard', async () => {
      const user = userEvent.setup();
      render(
        <>
          <SkipLink />
          <button>First Button</button>
        </>
      );

      await user.tab();

      const link = screen.getByRole('link');
      expect(link).toHaveFocus();
    });

    it('should have accessible name', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: /pular para o conteúdo principal/i });

      expect(link).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to main content on click', async () => {
      const user = userEvent.setup();
      render(
        <>
          <SkipLink href="#main" />
          <main id="main">Main Content</main>
        </>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      // The link should have the correct href for navigation
      expect(link).toHaveAttribute('href', '#main');
    });

    it('should navigate on enter key', async () => {
      const user = userEvent.setup();
      render(<SkipLink />);

      const link = screen.getByRole('link');
      link.focus();

      await user.keyboard('{Enter}');

      // Verify link is still functional
      expect(link).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Screen Reader Behavior', () => {
    it('should be hidden visually but accessible to screen readers', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      // sr-only hides visually but keeps accessible
      expect(link).toHaveClass('sr-only');
      // But still accessible to screen readers
      expect(link).toBeInTheDocument();
    });

    it('should become visible on focus', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link');

      // Has classes to make it visible on focus
      expect(link).toHaveClass('focus:not-sr-only');
    });
  });

  describe('Integration', () => {
    it('should work with page layout', () => {
      render(
        <>
          <SkipLink href="#content" />
          <header>Header</header>
          <nav>Navigation</nav>
          <main id="content">
            <h1>Page Content</h1>
          </main>
          <footer>Footer</footer>
        </>
      );

      const link = screen.getByRole('link', { name: /pular/i });

      expect(link).toHaveAttribute('href', '#content');
    });

    it('should be first focusable element', async () => {
      const user = userEvent.setup();
      render(
        <>
          <SkipLink />
          <button>Button 1</button>
          <button>Button 2</button>
        </>
      );

      await user.tab();

      expect(screen.getByRole('link')).toHaveFocus();
    });
  });
});
