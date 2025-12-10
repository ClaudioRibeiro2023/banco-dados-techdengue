import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from '@/components/forms/date-range-picker';

describe('DateRangePicker', () => {
  describe('Rendering', () => {
    it('should render button with id="date"', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date');
      expect(button).toBeInTheDocument();
    });

    it('should show default placeholder', () => {
      render(<DateRangePicker />);

      expect(screen.getByText('Selecione um período')).toBeInTheDocument();
    });

    it('should show custom placeholder', () => {
      render(<DateRangePicker placeholder="Escolha as datas" />);

      expect(screen.getByText('Escolha as datas')).toBeInTheDocument();
    });

    it('should render calendar icon', () => {
      const { container } = render(<DateRangePicker />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have outline variant button', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date');
      expect(button).toHaveClass('justify-start');
    });
  });

  describe('Date Display', () => {
    it('should display from date only when no to date', () => {
      const value = {
        from: new Date('2024-06-15'),
        to: undefined,
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should contain some date text (format may vary by locale)
      expect(button?.textContent).toBeTruthy();
      expect(button?.textContent).not.toContain('Selecione um período');
    });

    it('should display full range when both dates are set', () => {
      const value = {
        from: new Date('2024-06-01'),
        to: new Date('2024-06-30'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should contain a separator indicating range
      expect(button?.textContent).toContain('-');
    });

    it('should show placeholder when value is undefined', () => {
      render(<DateRangePicker value={undefined} />);

      expect(screen.getByText('Selecione um período')).toBeInTheDocument();
    });

    it('should show placeholder when from is undefined', () => {
      render(<DateRangePicker value={{ from: undefined, to: undefined }} />);

      expect(screen.getByText('Selecione um período')).toBeInTheDocument();
    });

    it('should format dates when both from and to are provided', () => {
      const value = {
        from: new Date('2024-01-15'),
        to: new Date('2024-12-25'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should not show placeholder
      expect(button?.textContent).not.toContain('Selecione');
      // Should contain separator
      expect(button?.textContent).toContain('-');
    });
  });

  describe('Popover Interaction', () => {
    it('should open calendar popover when clicked', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      const button = document.getElementById('date')!;
      await user.click(button);

      // Calendar should be visible (look for calendar content)
      await waitFor(() => {
        // Radix Popover uses portal, so content should appear
        const popoverContent = document.querySelector('[data-radix-popper-content-wrapper]');
        expect(popoverContent || document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });

    it('should be accessible via keyboard', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      const button = document.getElementById('date')!;
      button.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        const popoverContent = document.querySelector('[data-radix-popper-content-wrapper]');
        expect(popoverContent || document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <DateRangePicker className="custom-picker" />
      );

      expect(container.firstChild).toHaveClass('custom-picker');
    });

    it('should maintain grid class', () => {
      const { container } = render(<DateRangePicker />);

      expect(container.firstChild).toHaveClass('grid');
      expect(container.firstChild).toHaveClass('gap-2');
    });
  });

  describe('Button Styling', () => {
    it('should have muted-foreground class when no value', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date');
      expect(button).toHaveClass('text-muted-foreground');
    });

    it('should not have muted-foreground class when value is set', () => {
      const value = {
        from: new Date('2024-06-01'),
        to: new Date('2024-06-30'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      expect(button).not.toHaveClass('text-muted-foreground');
    });

    it('should have fixed width', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date');
      expect(button).toHaveClass('w-[280px]');
    });
  });

  describe('onChange Callback', () => {
    it('should receive onChange prop', () => {
      const onChange = vi.fn();
      render(<DateRangePicker onChange={onChange} />);

      // Component should render without errors
      expect(document.getElementById('date')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle same from and to dates', () => {
      const sameDate = new Date('2024-06-15');
      const value = {
        from: sameDate,
        to: sameDate,
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should show some date content (not placeholder)
      expect(button?.textContent).not.toContain('Selecione');
    });

    it('should handle year boundaries', () => {
      const value = {
        from: new Date('2023-12-25'),
        to: new Date('2024-01-10'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should show a range (contains separator)
      expect(button?.textContent).toContain('-');
      expect(button?.textContent).not.toContain('Selecione');
    });

    it('should handle very old dates', () => {
      const value = {
        from: new Date('2000-01-01'),
        to: new Date('2000-12-31'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should show a range
      expect(button?.textContent).toContain('-');
      expect(button?.textContent).not.toContain('Selecione');
    });

    it('should handle future dates', () => {
      const value = {
        from: new Date('2030-01-01'),
        to: new Date('2030-12-31'),
      };

      render(<DateRangePicker value={value} />);

      const button = document.getElementById('date');
      // Should show a range
      expect(button?.textContent).toContain('-');
      expect(button?.textContent).not.toContain('Selecione');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date');
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should be focusable', () => {
      render(<DateRangePicker />);

      const button = document.getElementById('date')!;
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });
});
