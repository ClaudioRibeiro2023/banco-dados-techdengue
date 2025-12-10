import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from '@/components/accessibility/visually-hidden';

describe('VisuallyHidden Component', () => {
  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(<VisuallyHidden>Hidden Text</VisuallyHidden>);

      expect(screen.getByText('Hidden Text')).toBeInTheDocument();
    });

    it('should render as span by default', () => {
      render(<VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText('Content');

      expect(element.tagName).toBe('SPAN');
    });

    it('should have sr-only class', () => {
      render(<VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('sr-only');
    });
  });

  describe('Custom Element Type', () => {
    it('should render as div when specified', () => {
      render(<VisuallyHidden as="div">Content</VisuallyHidden>);

      const element = screen.getByText('Content');

      expect(element.tagName).toBe('DIV');
    });

    it('should render as p when specified', () => {
      render(<VisuallyHidden as="p">Content</VisuallyHidden>);

      const element = screen.getByText('Content');

      expect(element.tagName).toBe('P');
    });

    it('should render as h1 when specified', () => {
      render(<VisuallyHidden as="h1">Heading</VisuallyHidden>);

      const element = screen.getByRole('heading', { level: 1 });

      expect(element).toBeInTheDocument();
      expect(element.tagName).toBe('H1');
    });

    it('should render as h2 when specified', () => {
      render(<VisuallyHidden as="h2">Heading</VisuallyHidden>);

      const element = screen.getByRole('heading', { level: 2 });

      expect(element).toBeInTheDocument();
    });

    it('should render as label when specified', () => {
      render(<VisuallyHidden as="label">Label Text</VisuallyHidden>);

      const element = screen.getByText('Label Text');

      expect(element.tagName).toBe('LABEL');
    });

    it('should render as legend when specified', () => {
      render(
        <fieldset>
          <VisuallyHidden as="legend">Legend Text</VisuallyHidden>
        </fieldset>
      );

      const element = screen.getByText('Legend Text');

      expect(element.tagName).toBe('LEGEND');
    });
  });

  describe('Children Types', () => {
    it('should render text children', () => {
      render(<VisuallyHidden>Simple text</VisuallyHidden>);

      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should render element children', () => {
      render(
        <VisuallyHidden>
          <strong>Bold text</strong>
        </VisuallyHidden>
      );

      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <VisuallyHidden>
          <span>First</span>
          <span>Second</span>
        </VisuallyHidden>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render fragment children', () => {
      render(
        <VisuallyHidden>
          <>
            <span>Fragment 1</span>
            <span>Fragment 2</span>
          </>
        </VisuallyHidden>
      );

      expect(screen.getByText('Fragment 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<VisuallyHidden>Screen reader text</VisuallyHidden>);

      // Even with sr-only, the element is in the DOM and accessible
      expect(screen.getByText('Screen reader text')).toBeInTheDocument();
    });

    it('should maintain semantic meaning with as prop', () => {
      render(<VisuallyHidden as="h1">Page Title</VisuallyHidden>);

      const heading = screen.getByRole('heading', { name: 'Page Title' });

      expect(heading).toBeInTheDocument();
    });

    it('should work as accessible label', () => {
      render(
        <>
          <VisuallyHidden as="label" id="hidden-label">
            Email address
          </VisuallyHidden>
          <input aria-labelledby="hidden-label" type="email" />
        </>
      );

      expect(screen.getByText('Email address')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work for icon button labels', () => {
      render(
        <button>
          <svg data-testid="icon" />
          <VisuallyHidden>Close menu</VisuallyHidden>
        </button>
      );

      const button = screen.getByRole('button', { name: 'Close menu' });

      expect(button).toBeInTheDocument();
    });

    it('should work for link descriptions', () => {
      render(
        <a href="/">
          Read more
          <VisuallyHidden> about accessibility</VisuallyHidden>
        </a>
      );

      // Note: sr-only content may have whitespace handling differences
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent(/Read more/);
      expect(link).toHaveTextContent(/accessibility/);
    });

    it('should work for form field hints', () => {
      render(
        <div>
          <label htmlFor="password">Password</label>
          <VisuallyHidden as="span" id="password-hint">
            Must be at least 8 characters
          </VisuallyHidden>
          <input id="password" type="password" aria-describedby="password-hint" />
        </div>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('should work for skip navigation alternative text', () => {
      render(
        <nav aria-label="Main navigation">
          <VisuallyHidden as="h2">Navigation Menu</VisuallyHidden>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
          </ul>
        </nav>
      );

      expect(
        screen.getByRole('heading', { name: 'Navigation Menu', level: 2 })
      ).toBeInTheDocument();
    });
  });

  describe('sr-only Class Behavior', () => {
    it('should apply sr-only class regardless of element type', () => {
      const { rerender } = render(<VisuallyHidden as="span">Text</VisuallyHidden>);
      expect(screen.getByText('Text')).toHaveClass('sr-only');

      rerender(<VisuallyHidden as="div">Text</VisuallyHidden>);
      expect(screen.getByText('Text')).toHaveClass('sr-only');

      rerender(<VisuallyHidden as="p">Text</VisuallyHidden>);
      expect(screen.getByText('Text')).toHaveClass('sr-only');
    });
  });

  describe('DOM Structure', () => {
    it('should render single wrapper element', () => {
      const { container } = render(<VisuallyHidden>Content</VisuallyHidden>);

      expect(container.children).toHaveLength(1);
    });

    it('should contain children inside wrapper', () => {
      render(
        <VisuallyHidden>
          <span data-testid="child">Child Element</span>
        </VisuallyHidden>
      );

      const child = screen.getByTestId('child');
      const wrapper = child.parentElement;

      expect(wrapper).toHaveClass('sr-only');
    });
  });

  describe('Integration with Form Elements', () => {
    it('should work as hidden label for inputs', () => {
      render(
        <div>
          <VisuallyHidden as="label" htmlFor="search">
            Search query
          </VisuallyHidden>
          <input id="search" type="search" placeholder="Search..." />
        </div>
      );

      const input = screen.getByRole('searchbox');
      const label = screen.getByText('Search query');

      expect(input).toBeInTheDocument();
      expect(label).toHaveClass('sr-only');
    });

    it('should work with form fieldsets', () => {
      render(
        <fieldset>
          <VisuallyHidden as="legend">Personal Information</VisuallyHidden>
          <input type="text" placeholder="Name" />
        </fieldset>
      );

      const legend = screen.getByText('Personal Information');

      expect(legend.tagName).toBe('LEGEND');
      expect(legend).toHaveClass('sr-only');
    });
  });
});
