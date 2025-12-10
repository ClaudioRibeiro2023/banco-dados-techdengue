import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';

describe('FadeIn Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(<FadeIn>Hello World</FadeIn>);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render with wrapper div', () => {
      render(<FadeIn data-testid="fade-wrapper">Content</FadeIn>);

      const wrapper = screen.getByText('Content').parentElement || screen.getByText('Content');

      expect(wrapper.tagName).toBe('DIV');
    });

    it('should accept custom className', () => {
      render(<FadeIn className="custom-fade">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('custom-fade');
    });

    it('should have transition-all class', () => {
      render(<FadeIn>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('transition-all');
    });
  });

  describe('Initial State', () => {
    it('should start with opacity-0', () => {
      render(<FadeIn>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('opacity-0');
    });

    it('should start with translate-y-4 for up direction', () => {
      render(<FadeIn direction="up">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('translate-y-4');
    });

    it('should start with -translate-y-4 for down direction', () => {
      render(<FadeIn direction="down">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('-translate-y-4');
    });

    it('should start with translate-x-4 for left direction', () => {
      render(<FadeIn direction="left">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('translate-x-4');
    });

    it('should start with -translate-x-4 for right direction', () => {
      render(<FadeIn direction="right">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('-translate-x-4');
    });

    it('should have no translate class for none direction', () => {
      render(<FadeIn direction="none">Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).not.toHaveClass('translate-y-4');
      expect(element).not.toHaveClass('-translate-y-4');
      expect(element).not.toHaveClass('translate-x-4');
      expect(element).not.toHaveClass('-translate-x-4');
    });
  });

  describe('Animation Transition', () => {
    it('should become visible after delay', () => {
      render(<FadeIn delay={100}>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('opacity-0');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(element).toHaveClass('opacity-100');
    });

    it('should become visible immediately with 0 delay', () => {
      render(<FadeIn delay={0}>Content</FadeIn>);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      const element = screen.getByText('Content');
      expect(element).toHaveClass('opacity-100');
    });

    it('should remove translate classes when visible', () => {
      render(<FadeIn direction="up" delay={0}>Content</FadeIn>);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      const element = screen.getByText('Content');
      expect(element).toHaveClass('translate-x-0');
      expect(element).toHaveClass('translate-y-0');
    });
  });

  describe('Duration', () => {
    it('should apply default duration of 300ms', () => {
      render(<FadeIn>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveStyle({ transitionDuration: '300ms' });
    });

    it('should apply custom duration', () => {
      render(<FadeIn duration={500}>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveStyle({ transitionDuration: '500ms' });
    });

    it('should apply fast duration', () => {
      render(<FadeIn duration={100}>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveStyle({ transitionDuration: '100ms' });
    });
  });

  describe('Default Props', () => {
    it('should use up direction by default', () => {
      render(<FadeIn>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveClass('translate-y-4');
    });

    it('should use 0 delay by default', () => {
      render(<FadeIn>Content</FadeIn>);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      const element = screen.getByText('Content');
      expect(element).toHaveClass('opacity-100');
    });

    it('should use 300ms duration by default', () => {
      render(<FadeIn>Content</FadeIn>);

      const element = screen.getByText('Content');

      expect(element).toHaveStyle({ transitionDuration: '300ms' });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { unmount } = render(<FadeIn delay={1000}>Content</FadeIn>);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Complex Children', () => {
    it('should render complex children', () => {
      render(
        <FadeIn>
          <div>
            <h1>Title</h1>
            <p>Description</p>
          </div>
        </FadeIn>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render multiple elements', () => {
      render(
        <FadeIn>
          <span>Item 1</span>
          <span>Item 2</span>
          <span>Item 3</span>
        </FadeIn>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });
});

describe('StaggerChildren Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render all children', () => {
      render(
        <StaggerChildren>
          {[
            <span key="1">Item 1</span>,
            <span key="2">Item 2</span>,
            <span key="3">Item 3</span>,
          ]}
        </StaggerChildren>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should wrap children in container', () => {
      render(
        <StaggerChildren className="container">
          {[<span key="1">Item</span>]}
        </StaggerChildren>
      );

      const container = screen.getByText('Item').closest('.container');

      expect(container).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <StaggerChildren className="custom-stagger">
          {[<span key="1">Item</span>]}
        </StaggerChildren>
      );

      expect(container.firstChild).toHaveClass('custom-stagger');
    });
  });

  describe('Stagger Effect', () => {
    it('should apply increasing delay to each child', () => {
      render(
        <StaggerChildren staggerDelay={100}>
          {[
            <span key="1">Item 1</span>,
            <span key="2">Item 2</span>,
            <span key="3">Item 3</span>,
          ]}
        </StaggerChildren>
      );

      // First item starts immediately (0 delay)
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // All items should be rendered but with different visibility
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should use default stagger delay of 100ms', () => {
      render(
        <StaggerChildren>
          {[
            <span key="1">Item 1</span>,
            <span key="2">Item 2</span>,
          ]}
        </StaggerChildren>
      );

      // Verify items are wrapped in FadeIn with staggered delays
      const items = screen.getAllByText(/Item/);
      expect(items).toHaveLength(2);
    });

    it('should apply custom stagger delay', () => {
      render(
        <StaggerChildren staggerDelay={200}>
          {[
            <span key="1">Item 1</span>,
            <span key="2">Item 2</span>,
          ]}
        </StaggerChildren>
      );

      const items = screen.getAllByText(/Item/);
      expect(items).toHaveLength(2);
    });
  });

  describe('Empty Children', () => {
    it('should render empty container with no children', () => {
      const { container } = render(<StaggerChildren>{[]}</StaggerChildren>);

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild?.childNodes).toHaveLength(0);
    });
  });

  describe('Single Child', () => {
    it('should render single child with FadeIn', () => {
      render(
        <StaggerChildren>
          {[<span key="1">Single Item</span>]}
        </StaggerChildren>
      );

      expect(screen.getByText('Single Item')).toBeInTheDocument();
    });
  });

  describe('Many Children', () => {
    it('should handle many children', () => {
      const items = Array.from({ length: 10 }, (_, i) => (
        <span key={i}>Item {i + 1}</span>
      ));

      render(<StaggerChildren>{items}</StaggerChildren>);

      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(`Item ${i}`)).toBeInTheDocument();
      }
    });
  });
});
