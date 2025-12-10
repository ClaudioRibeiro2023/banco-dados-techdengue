import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

describe('Label', () => {
  describe('Basic Rendering', () => {
    it('should render label with text', () => {
      render(<Label>Username</Label>);

      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toBeInTheDocument();
    });

    it('should render as label element', () => {
      render(<Label data-testid="test-label">Test</Label>);

      const label = screen.getByTestId('test-label');
      expect(label.tagName).toBe('LABEL');
    });
  });

  describe('Styling Classes', () => {
    it('should have flex class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('flex');
    });

    it('should have items-center class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('items-center');
    });

    it('should have gap-2 class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('gap-2');
    });

    it('should have text-sm class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('text-sm');
    });

    it('should have leading-none class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('leading-none');
    });

    it('should have font-medium class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('font-medium');
    });

    it('should have select-none class', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('select-none');
    });
  });

  describe('Disabled State Styling', () => {
    it('should have group-data disabled styling', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('group-data-[disabled=true]:pointer-events-none');
      expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
    });

    it('should have peer-disabled styling', () => {
      render(<Label>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
      expect(label).toHaveClass('peer-disabled:opacity-50');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Label className="custom-label">Custom</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('custom-label');
    });

    it('should merge custom className with defaults', () => {
      render(<Label className="my-custom">Merged</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('my-custom');
      expect(label).toHaveClass('flex');
      expect(label).toHaveClass('text-sm');
    });
  });

  describe('htmlFor Attribute', () => {
    it('should accept htmlFor prop', () => {
      render(<Label htmlFor="email-input">Email</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should associate with input', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </div>
      );

      const input = screen.getByRole('textbox');
      const label = document.querySelector('[data-slot="label"]');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(<Label data-testid="my-label">Test</Label>);

      expect(screen.getByTestId('my-label')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Label id="label-1">Test</Label>);

      expect(document.getElementById('label-1')).toBeInTheDocument();
    });

    it('should forward aria-label', () => {
      render(<Label aria-label="Custom aria label">Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toHaveAttribute('aria-label', 'Custom aria label');
    });
  });

  describe('Children Rendering', () => {
    it('should render text children', () => {
      render(<Label>Simple text</Label>);

      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Label>
          <span data-testid="icon">*</span>
          Required Field
        </Label>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Required Field')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Label>
          <span>First</span>
          <span>Second</span>
        </Label>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work with checkbox', () => {
      render(
        <div>
          <input type="checkbox" id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      );

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toBeInTheDocument();
      expect(screen.getByText('Accept terms and conditions')).toBeInTheDocument();
    });

    it('should work in form field', () => {
      render(
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should work with required indicator', () => {
      render(
        <Label>
          Password
          <span className="text-destructive">*</span>
        </Label>
      );

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should work with optional indicator', () => {
      render(
        <Label>
          Nickname
          <span className="text-muted-foreground">(optional)</span>
        </Label>
      );

      expect(screen.getByText('Nickname')).toBeInTheDocument();
      expect(screen.getByText('(optional)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be associated with form control', () => {
      render(
        <div>
          <Label htmlFor="accessible-input">Accessible Label</Label>
          <Input id="accessible-input" />
        </div>
      );

      const input = screen.getByLabelText('Accessible Label');
      expect(input).toBeInTheDocument();
    });

    it('should have accessible name', () => {
      render(<Label>Accessible Name</Label>);

      expect(screen.getByText('Accessible Name')).toBeInTheDocument();
    });
  });

  describe('Multiple Labels', () => {
    it('should render multiple labels', () => {
      render(
        <div>
          <Label htmlFor="field1">Field 1</Label>
          <Label htmlFor="field2">Field 2</Label>
          <Label htmlFor="field3">Field 3</Label>
        </div>
      );

      const labels = document.querySelectorAll('[data-slot="label"]');
      expect(labels).toHaveLength(3);
    });

    it('should each have correct htmlFor', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <Label htmlFor="password">Password</Label>
        </div>
      );

      const usernameLabel = screen.getByText('Username');
      const passwordLabel = screen.getByText('Password');

      expect(usernameLabel).toHaveAttribute('for', 'username');
      expect(passwordLabel).toHaveAttribute('for', 'password');
    });
  });

  describe('Edge Cases', () => {
    it('should render empty label', () => {
      render(<Label data-testid="empty-label" />);

      expect(screen.getByTestId('empty-label')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Label className={undefined}>Test</Label>);

      const label = document.querySelector('[data-slot="label"]');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('flex');
    });

    it('should handle long text', () => {
      const longText = 'A'.repeat(200);
      render(<Label>{longText}</Label>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Label>Email & Password (required)</Label>);

      expect(screen.getByText('Email & Password (required)')).toBeInTheDocument();
    });
  });
});
