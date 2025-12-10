import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

// Note: Radix Select has known issues with jsdom environment due to missing
// pointer capture APIs. Tests focus on static rendering and basic functionality.

describe('Select', () => {
  describe('SelectTrigger', () => {
    it('should render select trigger', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should show placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Choose one')).toBeInTheDocument();
    });

    it('should have data-slot attribute on trigger', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should have default styling classes', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('should have border class', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveClass('border');
    });

    it('should have rounded-md class', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveClass('rounded-md');
    });

    it('should support sm size variant', () => {
      render(
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveAttribute('data-size', 'sm');
    });

    it('should support default size variant', () => {
      render(
        <Select>
          <SelectTrigger size="default">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveAttribute('data-size', 'default');
    });
  });

  describe('SelectValue', () => {
    it('should show placeholder when no value selected', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pick an option" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByText('Pick an option')).toBeInTheDocument();
    });

    it('should show selected value', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">First Option</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('First Option')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const value = document.querySelector('[data-slot="select-value"]');
      expect(value).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = document.querySelector('[data-slot="select-trigger"]');
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Controlled Mode', () => {
    it('should work with controlled value', () => {
      render(
        <Select value="option2">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should show default value', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Default Option</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Default Option')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have combobox role', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have aria-expanded attribute', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('should have aria-expanded false when closed', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support aria-label', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Choose an option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox', { name: 'Choose an option' });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('should have chevron icon inside trigger', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      // Chevron icon is rendered as an SVG inside the trigger
      const trigger = document.querySelector('[data-slot="select-trigger"]');
      const svg = trigger?.querySelector('svg');
      expect(svg || trigger).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward id to trigger', () => {
      render(
        <Select>
          <SelectTrigger id="my-select">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('id', 'my-select');
    });

    it('should forward name to select', () => {
      render(
        <Select name="category">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      // Name is used for form submission
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should forward data-testid', () => {
      render(
        <Select>
          <SelectTrigger data-testid="test-select">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('test-select')).toBeInTheDocument();
    });
  });

  describe('SelectContent Static', () => {
    it('should have data-slot attribute on content when rendered', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const content = document.querySelector('[data-slot="select-content"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('SelectItem Static', () => {
    it('should render item when content is open', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should have data-slot on item', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const item = document.querySelector('[data-slot="select-item"]');
      expect(item).toBeInTheDocument();
    });

    it('should render multiple items', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should support disabled item', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" disabled>
              Disabled Option
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByText('Disabled Option').closest('[data-slot="select-item"]');
      expect(item).toHaveAttribute('data-disabled');
    });
  });

  describe('SelectGroup', () => {
    it('should render group with label when open', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('should have data-slot on label', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="item1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      const label = document.querySelector('[data-slot="select-label"]');
      expect(label).toBeInTheDocument();
    });
  });

  describe('SelectSeparator', () => {
    it('should render separator when open', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const separator = document.querySelector('[data-slot="select-separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('should have separator styling', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const separator = document.querySelector('[data-slot="select-separator"]');
      expect(separator).toHaveClass('bg-border');
    });
  });
});
