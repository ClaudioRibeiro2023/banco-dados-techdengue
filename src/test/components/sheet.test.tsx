import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

describe('Sheet', () => {
  describe('Basic Rendering', () => {
    it('should render trigger element', () => {
      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open Sheet</button>
          </SheetTrigger>
          <SheetContent>Sheet content</SheetContent>
        </Sheet>
      );

      expect(screen.getByRole('button', { name: 'Open Sheet' })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Hidden content</SheetContent>
        </Sheet>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should have data-slot on trigger', () => {
      render(
        <Sheet>
          <SheetTrigger>Trigger</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      const trigger = document.querySelector('[data-slot="sheet-trigger"]');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Open/Close Behavior', () => {
    it('should open sheet on trigger click', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Sheet is open</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Sheet is open')).toBeInTheDocument();
    });

    it('should show close button when open', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should close sheet when clicking close button', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should work with controlled open state', () => {
      const { rerender } = render(
        <Sheet open={false}>
          <SheetTrigger>Trigger</SheetTrigger>
          <SheetContent>Controlled Content</SheetContent>
        </Sheet>
      );

      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

      rerender(
        <Sheet open={true}>
          <SheetTrigger>Trigger</SheetTrigger>
          <SheetContent>Controlled Content</SheetContent>
        </Sheet>
      );

      expect(screen.getByText('Controlled Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when opened', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Sheet onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('SheetContent Styling', () => {
    it('should have data-slot on content when open', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toBeInTheDocument();
    });

    it('should have bg-background class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('bg-background');
    });

    it('should have z-50 class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('z-50');
    });

    it('should have shadow-lg class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('shadow-lg');
    });

    it('should accept custom className', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent className="custom-sheet">Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('custom-sheet');
    });
  });

  describe('Side Prop', () => {
    it('should default to right side', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('right-0');
      expect(content).toHaveClass('border-l');
    });

    it('should support left side', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent side="left">Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('left-0');
      expect(content).toHaveClass('border-r');
    });

    it('should support top side', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent side="top">Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('top-0');
      expect(content).toHaveClass('border-b');
    });

    it('should support bottom side', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent side="bottom">Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const content = document.querySelector('[data-slot="sheet-content"]');
      expect(content).toHaveClass('bottom-0');
      expect(content).toHaveClass('border-t');
    });
  });

  describe('SheetHeader', () => {
    it('should render header', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    });

    it('should have data-slot on header', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>Header</SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toBeInTheDocument();
    });

    it('should have flex-col class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>Header</SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toHaveClass('flex-col');
    });

    it('should have p-4 class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>Header</SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toHaveClass('p-4');
    });

    it('should accept custom className', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="custom-header">Header</SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const header = document.querySelector('[data-slot="sheet-header"]');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('SheetFooter', () => {
    it('should render footer', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetFooter>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should have data-slot on footer', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetFooter>Footer</SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const footer = document.querySelector('[data-slot="sheet-footer"]');
      expect(footer).toBeInTheDocument();
    });

    it('should have mt-auto class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetFooter>Footer</SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const footer = document.querySelector('[data-slot="sheet-footer"]');
      expect(footer).toHaveClass('mt-auto');
    });

    it('should have p-4 class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetFooter>Footer</SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const footer = document.querySelector('[data-slot="sheet-footer"]');
      expect(footer).toHaveClass('p-4');
    });
  });

  describe('SheetTitle', () => {
    it('should render title', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>My Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should have data-slot on title', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const title = document.querySelector('[data-slot="sheet-title"]');
      expect(title).toBeInTheDocument();
    });

    it('should have font-semibold class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const title = document.querySelector('[data-slot="sheet-title"]');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('SheetDescription', () => {
    it('should render description', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>My description text</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('My description text')).toBeInTheDocument();
    });

    it('should have data-slot on description', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const description = document.querySelector('[data-slot="sheet-description"]');
      expect(description).toBeInTheDocument();
    });

    it('should have text-sm class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const description = document.querySelector('[data-slot="sheet-description"]');
      expect(description).toHaveClass('text-sm');
    });

    it('should have text-muted-foreground class', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const description = document.querySelector('[data-slot="sheet-description"]');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('SheetClose', () => {
    it('should render custom close trigger', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetClose asChild>
              <button>Custom Close</button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('button', { name: 'Custom Close' })).toBeInTheDocument();
    });

    it('should have data-slot on close', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetClose>Close Me</SheetClose>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const close = document.querySelector('[data-slot="sheet-close"]');
      expect(close).toBeInTheDocument();
    });
  });

  describe('Overlay', () => {
    it('should render overlay when open', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should have bg-black/50 class on overlay', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      expect(overlay).toHaveClass('bg-black/50');
    });

    it('should have fixed class on overlay', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      expect(overlay).toHaveClass('fixed');
    });

    it('should have inset-0 class on overlay', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      expect(overlay).toHaveClass('inset-0');
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role when open', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Dialog Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have sr-only text on close button', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open</button>
          </SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('Complete Sheet Structure', () => {
    it('should render complete sheet structure', async () => {
      const user = userEvent.setup();

      render(
        <Sheet>
          <SheetTrigger asChild>
            <button>Open Profile Editor</button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when done.
              </SheetDescription>
            </SheetHeader>
            <div>Form content here</div>
            <SheetFooter>
              <button type="submit">Save changes</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: 'Open Profile Editor' }));

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText(/Make changes to your profile/)).toBeInTheDocument();
      expect(screen.getByText('Form content here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    });
  });
});
