import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea', () => {
  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(
        <ScrollArea>
          <div>Scroll content</div>
        </ScrollArea>
      );

      expect(screen.getByText('Scroll content')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should render viewport with data-slot', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toBeInTheDocument();
    });
  });

  describe('Container Styling', () => {
    it('should have relative class', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveClass('relative');
    });

    it('should accept custom className', () => {
      render(
        <ScrollArea className="custom-scroll">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveClass('custom-scroll');
    });

    it('should merge custom className with defaults', () => {
      render(
        <ScrollArea className="h-64">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveClass('relative');
      expect(scrollArea).toHaveClass('h-64');
    });
  });

  describe('Viewport Styling', () => {
    it('should have size-full class on viewport', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('size-full');
    });

    it('should have rounded-[inherit] class', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('rounded-[inherit]');
    });

    it('should have outline-none class', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('outline-none');
    });
  });

  // Note: In jsdom, ScrollArea scrollbars may not render because there's no
  // actual scrollable content. The ScrollBar component requires ScrollArea context.
  // We test the ScrollArea container and viewport which always render.;

  describe('Content Rendering', () => {
    it('should render text content', () => {
      render(
        <ScrollArea>
          <p>Paragraph content</p>
        </ScrollArea>
      );

      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ScrollArea>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render nested elements', () => {
      render(
        <ScrollArea>
          <div>
            <h2>Title</h2>
            <p>Description</p>
            <ul>
              <li>List item</li>
            </ul>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('List item')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work with fixed height container', () => {
      render(
        <ScrollArea className="h-48">
          <div style={{ height: '500px' }}>Tall content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveClass('h-48');
    });

    it('should work with fixed width container', () => {
      render(
        <ScrollArea className="w-48">
          <div style={{ width: '500px' }}>Wide content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveClass('w-48');
    });

    it('should work for list scrolling', () => {
      render(
        <ScrollArea className="h-32">
          <ul>
            {Array.from({ length: 20 }, (_, i) => (
              <li key={i}>Item {i + 1}</li>
            ))}
          </ul>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 20')).toBeInTheDocument();
    });

    it('should work for card content', () => {
      render(
        <div className="card">
          <ScrollArea className="h-64">
            <div>Card scrollable content</div>
          </ScrollArea>
        </div>
      );

      expect(screen.getByText('Card scrollable content')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(
        <ScrollArea data-testid="scroll-container">
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-container')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(
        <ScrollArea id="my-scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      expect(document.getElementById('my-scroll-area')).toBeInTheDocument();
    });

    it('should forward aria-label', () => {
      render(
        <ScrollArea aria-label="Scrollable content">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = document.querySelector('[data-slot="scroll-area"]');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
    });
  });

  describe('Focus States', () => {
    it('should have focus-visible ring styles on viewport', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('focus-visible:ring-[3px]');
    });

    it('should have focus-visible outline styles', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('focus-visible:outline-1');
    });
  });

  describe('ScrollArea with Content', () => {
    it('should render large content', () => {
      render(
        <ScrollArea>
          <div style={{ width: '500px', height: '500px' }}>Large content</div>
        </ScrollArea>
      );

      expect(screen.getByText('Large content')).toBeInTheDocument();
    });
  });

  describe('Transition Styles', () => {
    it('should have transition class on viewport', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
      expect(viewport).toHaveClass('transition-[color,box-shadow]');
    });
  });
});
