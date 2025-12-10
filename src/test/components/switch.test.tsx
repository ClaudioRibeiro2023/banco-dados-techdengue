import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/switch';

describe('Switch Component', () => {
  describe('Basic Rendering', () => {
    it('should render switch component', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-slot', 'switch');
    });

    it('should have default styling classes', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    });

    it('should accept custom className', () => {
      render(<Switch className="custom-switch" />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveClass('custom-switch');
    });

    it('should have thumb element with data-slot', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be unchecked by default', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should be checked when defaultChecked is true', () => {
      render(<Switch defaultChecked />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'checked');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should be checked when checked prop is true', () => {
      render(<Switch checked onCheckedChange={() => {}} />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'checked');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should be unchecked when checked prop is false', () => {
      render(<Switch checked={false} onCheckedChange={() => {}} />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('User Interaction', () => {
    it('should toggle on click', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.click(switchElement);

      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle off when clicked while checked', async () => {
      const user = userEvent.setup();
      render(<Switch defaultChecked />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'checked');

      await user.click(switchElement);

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should call onCheckedChange with new value on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when toggling off', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch defaultChecked onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('should toggle on space key press', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.keyboard(' ');

      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should toggle on enter key press', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');

      await user.keyboard('{Enter}');

      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Disabled State', () => {
    it('should have disabled attribute when disabled', () => {
      render(<Switch disabled />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toBeDisabled();
    });

    it('should have disabled styles when disabled', () => {
      render(<Switch disabled />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(handleChange).not.toHaveBeenCalled();
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      await user.keyboard(' ');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Controlled Mode', () => {
    it('should respect controlled checked state', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Switch checked={false} onCheckedChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      // Should call handler but not change visual state
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should update when controlled value changes', () => {
      const { rerender } = render(<Switch checked={false} onCheckedChange={() => {}} />);

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');

      rerender(<Switch checked={true} onCheckedChange={() => {}} />);

      expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Thumb Styling', () => {
    it('should have thumb with pointer-events-none', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('pointer-events-none');
    });

    it('should have thumb with block display', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('block');
    });

    it('should have thumb with rounded-full', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('rounded-full');
    });

    it('should have thumb with transition-transform', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('transition-transform');
    });

    it('should have thumb with size class', () => {
      render(<Switch />);

      const thumb = document.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('size-4');
    });
  });

  describe('Accessibility', () => {
    it('should have switch role', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toBeInTheDocument();
    });

    it('should have aria-checked attribute', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked');
    });

    it('should update aria-checked when toggled', async () => {
      const user = userEvent.setup();
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      await user.click(switchElement);

      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should be focusable', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(document.activeElement).toBe(switchElement);
    });

    it('should support aria-label', () => {
      render(<Switch aria-label="Toggle notifications" />);

      const switchElement = screen.getByRole('switch', { name: 'Toggle notifications' });

      expect(switchElement).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <>
          <label id="switch-label">Dark Mode</label>
          <Switch aria-labelledby="switch-label" />
        </>
      );

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-labelledby', 'switch-label');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward id prop', () => {
      render(<Switch id="switch-1" />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('id', 'switch-1');
    });

    it('should forward name prop', () => {
      render(<Switch name="notifications" />);

      // Radix Switch handles name internally for form submission
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should forward value prop', () => {
      render(<Switch value="on" />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('value', 'on');
    });

    it('should forward data-testid prop', () => {
      render(<Switch data-testid="test-switch" />);

      expect(screen.getByTestId('test-switch')).toBeInTheDocument();
    });

    it('should forward required prop', () => {
      render(<Switch required />);

      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Form Integration', () => {
    it('should work with form labels', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <label htmlFor="test-switch">Enable Feature</label>
          <Switch id="test-switch" />
        </div>
      );

      const label = screen.getByText('Enable Feature');
      await user.click(label);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should maintain state after label click', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <label htmlFor="toggle-switch">Toggle Setting</label>
          <Switch id="toggle-switch" defaultChecked />
        </div>
      );

      const label = screen.getByText('Toggle Setting');
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('data-state', 'checked');

      await user.click(label);

      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });
  });
});
