import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('should render as input element', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      // When no type is specified, browser treats it as text but DOM may not have explicit attribute
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should render email input', () => {
      render(<Input type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render number input', () => {
      render(<Input type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render tel input', () => {
      render(<Input type="tel" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render search input', () => {
      render(<Input type="search" />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render file input', () => {
      render(<Input type="file" />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter text..." />);

      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should have placeholder styling class', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Value Handling', () => {
    it('should display value', () => {
      render(<Input value="test value" readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });

    it('should handle defaultValue', () => {
      render(<Input defaultValue="default" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default');
    });

    it('should update value on change', async () => {
      const user = userEvent.setup();

      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      expect(input).toHaveValue('hello');
    });

    it('should call onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Input onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled input', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have disabled styling classes', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:pointer-events-none');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should not allow typing when disabled', async () => {
      const user = userEvent.setup();

      render(<Input disabled defaultValue="initial" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'more text');

      expect(input).toHaveValue('initial');
    });
  });

  describe('Read Only State', () => {
    it('should render read-only input', () => {
      render(<Input readOnly value="read only" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Required State', () => {
    it('should render required input', () => {
      render(<Input required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Styling Classes', () => {
    it('should have h-9 class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('h-9');
    });

    it('should have w-full class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('w-full');
    });

    it('should have rounded-md class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('rounded-md');
    });

    it('should have border class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('border');
    });

    it('should have bg-transparent class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('bg-transparent');
    });

    it('should have px-3 class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('px-3');
    });

    it('should have py-1 class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('py-1');
    });

    it('should have text-base class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('text-base');
    });

    it('should have shadow-xs class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('shadow-xs');
    });

    it('should have outline-none class', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass('outline-none');
    });
  });

  describe('Focus Styles', () => {
    it('should have focus-visible ring styles', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:ring-ring/50');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });

    it('should have focus-visible border styles', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-ring');
    });
  });

  describe('Aria Invalid Styles', () => {
    it('should have aria-invalid styles', () => {
      render(<Input aria-invalid="true" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('aria-invalid:border-destructive');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should merge custom className with defaults', () => {
      render(<Input className="my-custom" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('my-custom');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('rounded-md');
    });
  });

  describe('File Input Styling', () => {
    it('should have file input styling classes', () => {
      render(<Input type="file" />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveClass('file:text-foreground');
      expect(input).toHaveClass('file:bg-transparent');
      expect(input).toHaveClass('file:border-0');
      expect(input).toHaveClass('file:text-sm');
      expect(input).toHaveClass('file:font-medium');
    });
  });

  describe('Selection Styling', () => {
    it('should have selection styling classes', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('selection:bg-primary');
      expect(input).toHaveClass('selection:text-primary-foreground');
    });
  });

  describe('Props Forwarding', () => {
    it('should forward data-testid', () => {
      render(<Input data-testid="my-input" />);

      expect(screen.getByTestId('my-input')).toBeInTheDocument();
    });

    it('should forward id prop', () => {
      render(<Input id="input-1" />);

      expect(document.getElementById('input-1')).toBeInTheDocument();
    });

    it('should forward name prop', () => {
      render(<Input name="username" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should forward aria-label', () => {
      render(<Input aria-label="Username input" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Username input');
    });

    it('should forward aria-describedby', () => {
      render(<Input aria-describedby="hint-text" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'hint-text');
    });

    it('should forward maxLength', () => {
      render(<Input maxLength={100} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '100');
    });

    it('should forward minLength', () => {
      render(<Input minLength={5} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '5');
    });

    it('should forward pattern', () => {
      render(<Input pattern="[A-Za-z]+" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[A-Za-z]+');
    });

    it('should forward autoComplete', () => {
      render(<Input autoComplete="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });

    it('should forward autoFocus', () => {
      render(<Input autoFocus />);

      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();

      render(<Input />);

      await user.tab();

      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('should handle keyboard input', async () => {
      const user = userEvent.setup();

      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('Hello World');

      expect(input).toHaveValue('Hello World');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', () => {
      render(
        <form>
          <Input name="email" type="email" />
        </form>
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<Input className="" />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle undefined type', () => {
      render(<Input type={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle very long value', () => {
      const longValue = 'a'.repeat(1000);
      render(<Input value={longValue} readOnly />);

      expect(screen.getByRole('textbox')).toHaveValue(longValue);
    });

    it('should handle special characters in value', () => {
      render(<Input value="<script>alert('xss')</script>" readOnly />);

      expect(screen.getByRole('textbox')).toHaveValue("<script>alert('xss')</script>");
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when focused', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      render(<Input onFocus={onFocus} />);

      await user.tab();

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      render(<Input onBlur={onBlur} />);

      await user.tab();
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should call onKeyDown on key press', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();

      render(<Input onKeyDown={onKeyDown} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('a');

      expect(onKeyDown).toHaveBeenCalled();
    });
  });
});
