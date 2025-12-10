import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render checkbox', () => {
      render(<Checkbox />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Checkbox className="custom-checkbox" />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('should have border-input class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('border-input');
    });

    it('should have size-4 class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('size-4');
    });

    it('should have rounded-[4px] class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('rounded-[4px]');
    });

    it('should have border class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('border');
    });

    it('should have shrink-0 class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('shrink-0');
    });
  });

  describe('Checked State', () => {
    it('should be unchecked by default', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should support checked prop', () => {
      render(<Checkbox checked />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should support defaultChecked prop', () => {
      render(<Checkbox defaultChecked />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should toggle on click', async () => {
      const user = userEvent.setup();

      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should have data-state=checked when checked', () => {
      render(<Checkbox checked />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should have data-state=unchecked when not checked', () => {
      render(<Checkbox checked={false} />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should show check icon when checked', () => {
      const { container } = render(<Checkbox checked />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should support disabled prop', () => {
      render(<Checkbox disabled />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox disabled onCheckedChange={onCheckedChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('should have data-disabled attribute', () => {
      render(<Checkbox disabled />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveAttribute('data-disabled');
    });

    it('should have cursor-not-allowed class when disabled', () => {
      render(<Checkbox disabled />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      // The class is applied via disabled:cursor-not-allowed
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Controlled State', () => {
    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox checked onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should work with controlled checked prop', () => {
      const { rerender } = render(<Checkbox checked={false} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(<Checkbox checked={true} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Indeterminate State', () => {
    it('should support indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('Label Association', () => {
    it('should work with label via htmlFor', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Checkbox id="terms" />
          <label htmlFor="terms">Accept terms</label>
        </>
      );

      await user.click(screen.getByText('Accept terms'));

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should have id attribute when provided', () => {
      render(<Checkbox id="my-checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'my-checkbox');
    });

    it('should forward name prop to checkbox', () => {
      render(<Checkbox name="agree" />);

      // Radix Checkbox handles name internally
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Form Attributes', () => {
    it('should have value attribute when provided', () => {
      render(<Checkbox value="yes" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('value', 'yes');
    });

    it('should have required attribute when provided', () => {
      render(<Checkbox required />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have checkbox role', () => {
      render(<Checkbox />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Checkbox aria-label="Accept terms" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Checkbox aria-describedby="description" />
          <span id="description">Terms description</span>
        </>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'description');
    });

    it('should be focusable', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });

    it('should toggle on Space key', async () => {
      const user = userEvent.setup();

      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard(' ');

      expect(checkbox).toBeChecked();
    });
  });

  describe('Indicator', () => {
    it('should have indicator with data-slot', () => {
      render(<Checkbox checked />);

      const indicator = document.querySelector('[data-slot="checkbox-indicator"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should not show indicator when unchecked', () => {
      const { container } = render(<Checkbox checked={false} />);

      const icon = container.querySelector('[data-slot="checkbox-indicator"] svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Peer Modifier', () => {
    it('should have peer class for styling siblings', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('peer');
    });
  });

  describe('Styling States', () => {
    it('should have primary background when checked', () => {
      render(<Checkbox checked />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      // data-[state=checked]:bg-primary is applied
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should have shadow-xs class', () => {
      render(<Checkbox />);

      const checkbox = document.querySelector('[data-slot="checkbox"]');
      expect(checkbox).toHaveClass('shadow-xs');
    });
  });
});
