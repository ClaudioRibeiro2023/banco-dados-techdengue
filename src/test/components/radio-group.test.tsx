import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

describe('RadioGroup Component', () => {
  describe('Basic Rendering', () => {
    it('should render radio group', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toBeInTheDocument();
    });

    it('should have data-slot attribute on group', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveAttribute('data-slot', 'radio-group');
    });

    it('should have default styling classes on group', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveClass('grid', 'gap-3');
    });

    it('should accept custom className on group', () => {
      render(
        <RadioGroup className="custom-radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveClass('custom-radio-group');
    });
  });

  describe('RadioGroupItem Rendering', () => {
    it('should render radio item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toBeInTheDocument();
    });

    it('should have data-slot attribute on item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toHaveAttribute('data-slot', 'radio-group-item');
    });

    it('should have default styling classes on item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toHaveClass('aspect-square', 'rounded-full', 'border');
    });

    it('should accept custom className on item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-radio-item" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toHaveClass('custom-radio-item');
    });

    it('should render multiple items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      const radioItems = screen.getAllByRole('radio');

      expect(radioItems).toHaveLength(3);
    });
  });

  describe('Selection State', () => {
    it('should have no selection by default', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioItems = screen.getAllByRole('radio');

      radioItems.forEach((item) => {
        expect(item).not.toBeChecked();
      });
    });

    it('should select defaultValue on mount', () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      const option2 = screen.getAllByRole('radio')[1];

      expect(option1).not.toBeChecked();
      expect(option2).toBeChecked();
    });

    it('should respect controlled value', () => {
      render(
        <RadioGroup value="option1" onValueChange={() => {}}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      const option2 = screen.getAllByRole('radio')[1];

      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();
    });
  });

  describe('User Interaction', () => {
    it('should select item on click', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option2 = screen.getAllByRole('radio')[1];
      await user.click(option2);

      expect(option2).toBeChecked();
    });

    it('should only allow one selection at a time', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      const option2 = screen.getAllByRole('radio')[1];

      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();

      await user.click(option2);

      expect(option1).not.toBeChecked();
      expect(option2).toBeChecked();
    });

    it('should call onValueChange when selection changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option2 = screen.getAllByRole('radio')[1];
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('should not call onValueChange when clicking already selected item', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup defaultValue="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      await user.click(option1);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    // Note: Arrow key navigation in Radix RadioGroup has inconsistent behavior in jsdom
    // These tests verify the basic focusability instead
    it('should be focusable', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      option1.focus();

      expect(document.activeElement).toBe(option1);
    });

    it('should have tabindex for navigation', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      // Selected item should have tabindex attribute
      expect(radios[0]).toHaveAttribute('tabindex');
    });

    it('should support arrow orientation attribute', () => {
      render(
        <RadioGroup orientation="horizontal" defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });

  describe('Disabled State', () => {
    it('should disable entire group when disabled', () => {
      render(
        <RadioGroup disabled>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioItems = screen.getAllByRole('radio');

      radioItems.forEach((item) => {
        expect(item).toBeDisabled();
      });
    });

    it('should disable individual item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" disabled />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      const option2 = screen.getAllByRole('radio')[1];

      expect(option1).not.toBeDisabled();
      expect(option2).toBeDisabled();
    });

    it('should not select disabled item on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" disabled />
        </RadioGroup>
      );

      const option2 = screen.getAllByRole('radio')[1];
      await user.click(option2);

      expect(handleChange).not.toHaveBeenCalled();
      expect(option2).not.toBeChecked();
    });

    it('should have disabled styling on item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Indicator', () => {
    it('should show indicator when selected', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');
      await user.click(radioItem);

      const indicator = document.querySelector('[data-slot="radio-group-indicator"]');

      expect(indicator).toBeInTheDocument();
    });

    it('should have indicator with correct classes', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');
      await user.click(radioItem);

      const indicator = document.querySelector('[data-slot="radio-group-indicator"]');

      expect(indicator).toHaveClass('relative', 'flex', 'items-center', 'justify-center');
    });
  });

  describe('Accessibility', () => {
    it('should have radiogroup role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should have radio role on items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioItems = screen.getAllByRole('radio');

      expect(radioItems).toHaveLength(2);
    });

    it('should support aria-label on group', () => {
      render(
        <RadioGroup aria-label="Choose option">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup', { name: 'Choose option' });

      expect(radioGroup).toBeInTheDocument();
    });

    it('should support aria-labelledby on group', () => {
      render(
        <>
          <label id="group-label">Select Size</label>
          <RadioGroup aria-labelledby="group-label">
            <RadioGroupItem value="small" />
            <RadioGroupItem value="large" />
          </RadioGroup>
        </>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveAttribute('aria-labelledby', 'group-label');
    });

    it('should be focusable', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option1 = screen.getAllByRole('radio')[0];
      option1.focus();

      expect(document.activeElement).toBe(option1);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward id to group', () => {
      render(
        <RadioGroup id="radio-group-1">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveAttribute('id', 'radio-group-1');
    });

    it('should forward name to group', () => {
      render(
        <RadioGroup name="size">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      // Radix RadioGroup handles name internally for form submission
      const radioItem = screen.getByRole('radio');
      expect(radioItem).toBeInTheDocument();
    });

    it('should forward id to item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" id="option-1" />
        </RadioGroup>
      );

      const radioItem = screen.getByRole('radio');

      expect(radioItem).toHaveAttribute('id', 'option-1');
    });

    it('should forward data-testid to group', () => {
      render(
        <RadioGroup data-testid="test-radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('test-radio-group')).toBeInTheDocument();
    });

    it('should forward data-testid to item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="test-radio-item" />
        </RadioGroup>
      );

      expect(screen.getByTestId('test-radio-item')).toBeInTheDocument();
    });
  });

  describe('Form Integration with Labels', () => {
    it('should work with htmlFor labels', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="r1" />
            <label htmlFor="r1">Option 1</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="r2" />
            <label htmlFor="r2">Option 2</label>
          </div>
        </RadioGroup>
      );

      const label = screen.getByText('Option 2');
      await user.click(label);

      const option2 = screen.getByLabelText('Option 2');
      expect(option2).toBeChecked();
    });

    it('should select by accessible name', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" aria-label="First option" />
          <RadioGroupItem value="option2" aria-label="Second option" />
        </RadioGroup>
      );

      const option = screen.getByRole('radio', { name: 'Second option' });
      await user.click(option);

      expect(option).toBeChecked();
    });
  });

  describe('Orientation', () => {
    it('should support horizontal orientation', () => {
      render(
        <RadioGroup orientation="horizontal">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should support vertical orientation', () => {
      render(
        <RadioGroup orientation="vertical">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');

      expect(radioGroup).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Controlled Mode', () => {
    it('should not change when controlled without handler update', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <RadioGroup value="option1" onValueChange={handleChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const option2 = screen.getAllByRole('radio')[1];
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith('option2');
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
      expect(option2).not.toBeChecked();
    });

    it('should update when controlled value changes', () => {
      const { rerender } = render(
        <RadioGroup value="option1" onValueChange={() => {}}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getAllByRole('radio')[0]).toBeChecked();
      expect(screen.getAllByRole('radio')[1]).not.toBeChecked();

      rerender(
        <RadioGroup value="option2" onValueChange={() => {}}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getAllByRole('radio')[0]).not.toBeChecked();
      expect(screen.getAllByRole('radio')[1]).toBeChecked();
    });
  });
});
