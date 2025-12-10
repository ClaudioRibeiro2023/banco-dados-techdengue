import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';

describe('Popover', () => {
  describe('Basic Rendering', () => {
    it('should render trigger element', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open Popover</button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('button', { name: 'Open Popover' })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Hidden content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should have data-slot on trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = document.querySelector('[data-slot="popover-trigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Open/Close Behavior', () => {
    it('should open popover on trigger click', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Popover is open</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Popover is open')).toBeInTheDocument();
    });

    it('should close popover when clicking trigger again', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Toggle</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Toggle' });

      await user.click(trigger);
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should work with controlled open state', () => {
      const { rerender } = render(
        <Popover open={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Controlled Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Controlled Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Controlled Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when toggled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('PopoverContent Styling', () => {
    it('should have data-slot on content when open', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toBeInTheDocument();
    });

    it('should have bg-popover class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('bg-popover');
    });

    it('should have text-popover-foreground class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('text-popover-foreground');
    });

    it('should have rounded-md class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('rounded-md');
    });

    it('should have border class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('border');
    });

    it('should have p-4 padding class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('p-4');
    });

    it('should have w-72 width class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('w-72');
    });

    it('should have shadow-md class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('shadow-md');
    });

    it('should accept custom className', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent className="custom-popover">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('custom-popover');
    });
  });

  describe('Position Props', () => {
    it('should accept custom sideOffset', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent sideOffset={10}>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept align prop', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent align="start">Aligned start</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Aligned start')).toBeInTheDocument();
    });

    it('should accept side prop', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent side="bottom">Bottom content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Bottom content')).toBeInTheDocument();
    });
  });

  describe('Z-Index', () => {
    it('should have z-50 class', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveClass('z-50');
    });
  });

  describe('Animation Classes', () => {
    it('should have data-state attribute when open', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="popover-content"]');
      expect(content).toHaveAttribute('data-state', 'open');
    });
  });

  describe('PopoverAnchor', () => {
    it('should render anchor element', () => {
      render(
        <Popover>
          <PopoverAnchor asChild>
            <div data-testid="anchor">Anchor Element</div>
          </PopoverAnchor>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('anchor')).toBeInTheDocument();
    });

    it('should have data-slot on anchor', () => {
      render(
        <Popover>
          <PopoverAnchor>Anchor</PopoverAnchor>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const anchor = document.querySelector('[data-slot="popover-anchor"]');
      expect(anchor).toBeInTheDocument();
    });
  });

  describe('Content Types', () => {
    it('should render text content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Simple text content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render complex content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Title</h3>
              <p>Description paragraph</p>
              <button>Action</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render form inside popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <form>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="Enter email" />
              <button type="submit">Submit</button>
            </form>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  describe('Trigger Variants', () => {
    it('should work with button trigger', async () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Button Trigger</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('button', { name: 'Button Trigger' })).toBeInTheDocument();
    });

    it('should work with span trigger', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <span tabIndex={0}>Span Trigger</span>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Span Trigger')).toBeInTheDocument();
    });

    it('should work with default trigger (no asChild)', () => {
      render(
        <Popover>
          <PopoverTrigger>Default Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Default Trigger')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid to trigger', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="popover-trigger">Trigger</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });

    it('should forward id to content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent id="my-popover">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.getElementById('my-popover');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role on content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-expanded on trigger', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toHaveAttribute('aria-expanded');
    });
  });

  describe('Open State via prop', () => {
    it('should show content when open prop is true', () => {
      render(
        <Popover open>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Visible content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Visible content')).toBeInTheDocument();
    });

    it('should not show content when open prop is false', () => {
      render(
        <Popover open={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Hidden content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });
  });
});
