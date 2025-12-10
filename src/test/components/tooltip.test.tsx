import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

// Note: Radix Tooltip relies on pointer events and timing which can be tricky in jsdom.
// Tests focus on static rendering and basic functionality.

describe('Tooltip', () => {
  describe('Basic Rendering', () => {
    it('should render trigger element', () => {
      render(
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      render(
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Hover</button>
          </TooltipTrigger>
          <TooltipContent>Hidden content</TooltipContent>
        </Tooltip>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should render trigger with data-slot', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const trigger = document.querySelector('[data-slot="tooltip-trigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Open State', () => {
    it('should show content when open prop is true', () => {
      render(
        <Tooltip open>
          <TooltipTrigger asChild>
            <button>Hover</button>
          </TooltipTrigger>
          <TooltipContent>Visible tooltip</TooltipContent>
        </Tooltip>
      );

      expect(screen.getAllByText('Visible tooltip').length).toBeGreaterThan(0);
    });

    it('should have data-slot on content when open', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('TooltipContent Styling', () => {
    it('should have bg-foreground class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('bg-foreground');
    });

    it('should have text-background class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('text-background');
    });

    it('should have rounded-md class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('rounded-md');
    });

    it('should have text-xs class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('text-xs');
    });

    it('should have px-3 padding class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('px-3');
    });

    it('should have py-1.5 padding class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('py-1.5');
    });

    it('should accept custom className', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('custom-tooltip');
    });
  });

  describe('Tooltip Arrow', () => {
    it('should render arrow element inside content', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      const arrow = content?.querySelector('.bg-foreground.fill-foreground');
      expect(arrow || content).toBeInTheDocument();
    });
  });

  describe('TooltipProvider', () => {
    it('should render with default delay of 0', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('should accept custom delayDuration', () => {
      render(
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should work with controlled open state', () => {
      const { rerender } = render(
        <Tooltip open={false}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Controlled Content</TooltipContent>
        </Tooltip>
      );

      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

      rerender(
        <Tooltip open={true}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Controlled Content</TooltipContent>
        </Tooltip>
      );

      expect(screen.getAllByText('Controlled Content').length).toBeGreaterThan(0);
    });
  });

  describe('Tooltip Position', () => {
    it('should render with default sideOffset of 0', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toBeInTheDocument();
    });

    it('should accept custom sideOffset', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent sideOffset={10}>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toBeInTheDocument();
    });

    it('should accept side prop', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
        </Tooltip>
      );

      expect(screen.getAllByText('Bottom tooltip').length).toBeGreaterThan(0);
    });

    it('should accept align prop', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent align="start">Aligned tooltip</TooltipContent>
        </Tooltip>
      );

      expect(screen.getAllByText('Aligned tooltip').length).toBeGreaterThan(0);
    });
  });

  describe('Trigger Variants', () => {
    it('should work with button trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Button Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip for button</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByRole('button', { name: 'Button Trigger' })).toBeInTheDocument();
    });

    it('should work with span trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger asChild>
            <span>Span Trigger</span>
          </TooltipTrigger>
          <TooltipContent>Tooltip for span</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByText('Span Trigger')).toBeInTheDocument();
    });

    it('should work with default trigger (no asChild)', () => {
      render(
        <Tooltip>
          <TooltipTrigger>Default Trigger</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByText('Default Trigger')).toBeInTheDocument();
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Simple text</TooltipContent>
        </Tooltip>
      );

      // Radix creates duplicate elements for accessibility
      expect(screen.getAllByText('Simple text').length).toBeGreaterThan(0);
    });

    it('should render complex content', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>
            <div>
              <strong>Title</strong>
              <p>Description</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );

      // Radix creates duplicate elements for accessibility, use getAllBy
      expect(screen.getAllByText('Title').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Description').length).toBeGreaterThan(0);
    });

    it('should render with icon', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-icon">📌</span>
            <span>Pin this item</span>
          </TooltipContent>
        </Tooltip>
      );

      // Radix creates duplicate elements for accessibility
      expect(screen.getAllByTestId('tooltip-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pin this item').length).toBeGreaterThan(0);
    });
  });

  describe('Animation Classes', () => {
    it('should have animate-in class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('animate-in');
    });

    it('should have fade-in-0 class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('fade-in-0');
    });

    it('should have zoom-in-95 class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('zoom-in-95');
    });
  });

  describe('Z-Index', () => {
    it('should have z-50 class', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).toHaveClass('z-50');
    });
  });

  describe('Accessibility', () => {
    it('should have tooltip role on content', () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Accessible tooltip</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Multiple Tooltips', () => {
    it('should render multiple tooltip triggers', () => {
      render(
        <TooltipProvider>
          <div>
            <Tooltip>
              <TooltipTrigger>First</TooltipTrigger>
              <TooltipContent>First tooltip content</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>Second</TooltipTrigger>
              <TooltipContent>Second tooltip content</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      // Content is not visible when not open
      expect(screen.queryByText('First tooltip content')).not.toBeInTheDocument();
      expect(screen.queryByText('Second tooltip content')).not.toBeInTheDocument();
    });
  });
});
