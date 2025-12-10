import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Calendar, Mail, Settings } from 'lucide-react';

describe('Command', () => {
  describe('Basic Rendering', () => {
    it('should render command container', () => {
      render(<Command data-testid="command" />);

      expect(screen.getByTestId('command')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <Command>
          <div>Child content</div>
        </Command>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Command Styling', () => {
    it('should have bg-popover class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('bg-popover');
    });

    it('should have text-popover-foreground class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('text-popover-foreground');
    });

    it('should have flex class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('flex');
    });

    it('should have h-full class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('h-full');
    });

    it('should have w-full class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('w-full');
    });

    it('should have flex-col class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('flex-col');
    });

    it('should have overflow-hidden class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('overflow-hidden');
    });

    it('should have rounded-md class', () => {
      render(<Command />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('rounded-md');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept custom className', () => {
      render(<Command className="custom-command" />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('custom-command');
    });

    it('should merge with default classes', () => {
      render(<Command className="border" />);

      const command = document.querySelector('[data-slot="command"]');
      expect(command).toHaveClass('border');
      expect(command).toHaveClass('bg-popover');
    });
  });
});

describe('CommandInput', () => {
  describe('Basic Rendering', () => {
    it('should render input wrapper', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have input data-slot', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = document.querySelector('[data-slot="command-input"]');
      expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      const svg = wrapper?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display placeholder', () => {
      render(
        <Command>
          <CommandInput placeholder="Type a command..." />
        </Command>
      );

      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    });
  });

  describe('Input Wrapper Styling', () => {
    it('should have flex class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('flex');
    });

    it('should have h-9 class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('h-9');
    });

    it('should have items-center class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('items-center');
    });

    it('should have gap-2 class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('gap-2');
    });

    it('should have border-b class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('border-b');
    });

    it('should have px-3 class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const wrapper = document.querySelector('[data-slot="command-input-wrapper"]');
      expect(wrapper).toHaveClass('px-3');
    });
  });

  describe('Input Styling', () => {
    it('should have placeholder styling', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const input = document.querySelector('[data-slot="command-input"]');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should have bg-transparent class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const input = document.querySelector('[data-slot="command-input"]');
      expect(input).toHaveClass('bg-transparent');
    });

    it('should have w-full class', () => {
      render(
        <Command>
          <CommandInput />
        </Command>
      );

      const input = document.querySelector('[data-slot="command-input"]');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('Input Interaction', () => {
    it('should accept text input', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'test query');

      expect(input).toHaveValue('test query');
    });
  });
});

describe('CommandList', () => {
  describe('Basic Rendering', () => {
    it('should render list container', () => {
      render(
        <Command>
          <CommandList data-testid="command-list">
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('command-list')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const list = document.querySelector('[data-slot="command-list"]');
      expect(list).toBeInTheDocument();
    });
  });

  describe('List Styling', () => {
    it('should have max-h-[300px] class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const list = document.querySelector('[data-slot="command-list"]');
      expect(list).toHaveClass('max-h-[300px]');
    });

    it('should have overflow-y-auto class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const list = document.querySelector('[data-slot="command-list"]');
      expect(list).toHaveClass('overflow-y-auto');
    });

    it('should have overflow-x-hidden class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const list = document.querySelector('[data-slot="command-list"]');
      expect(list).toHaveClass('overflow-x-hidden');
    });
  });
});

describe('CommandEmpty', () => {
  describe('Basic Rendering', () => {
    it('should render empty message', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty>Empty</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = document.querySelector('[data-slot="command-empty"]');
      expect(empty).toBeInTheDocument();
    });
  });

  describe('Empty Styling', () => {
    it('should have py-6 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty>Empty</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = document.querySelector('[data-slot="command-empty"]');
      expect(empty).toHaveClass('py-6');
    });

    it('should have text-center class', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty>Empty</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = document.querySelector('[data-slot="command-empty"]');
      expect(empty).toHaveClass('text-center');
    });

    it('should have text-sm class', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty>Empty</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = document.querySelector('[data-slot="command-empty"]');
      expect(empty).toHaveClass('text-sm');
    });
  });
});

describe('CommandGroup', () => {
  describe('Basic Rendering', () => {
    it('should render group container', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = document.querySelector('[data-slot="command-group"]');
      expect(group).toBeInTheDocument();
    });
  });

  describe('Group Styling', () => {
    it('should have text-foreground class', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = document.querySelector('[data-slot="command-group"]');
      expect(group).toHaveClass('text-foreground');
    });

    it('should have overflow-hidden class', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = document.querySelector('[data-slot="command-group"]');
      expect(group).toHaveClass('overflow-hidden');
    });

    it('should have p-1 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = document.querySelector('[data-slot="command-group"]');
      expect(group).toHaveClass('p-1');
    });
  });
});

describe('CommandItem', () => {
  describe('Basic Rendering', () => {
    it('should render item', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Calendar</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Item Styling', () => {
    it('should have relative class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('relative');
    });

    it('should have flex class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('flex');
    });

    it('should have cursor-default class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('cursor-default');
    });

    it('should have items-center class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('items-center');
    });

    it('should have gap-2 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('gap-2');
    });

    it('should have rounded-sm class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('rounded-sm');
    });

    it('should have px-2 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('px-2');
    });

    it('should have py-1.5 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('py-1.5');
    });

    it('should have text-sm class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('text-sm');
    });

    it('should have select-none class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('select-none');
    });
  });

  describe('Item with Icon', () => {
    it('should render with icon', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              <Calendar data-testid="calendar-icon" />
              Calendar
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });
  });

  describe('Item Interaction', () => {
    it('should call onSelect when selected', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <Command>
          <CommandList>
            <CommandItem onSelect={onSelect}>Selectable Item</CommandItem>
          </CommandList>
        </Command>
      );

      const item = screen.getByText('Selectable Item');
      await user.click(item);

      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should have disabled styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled>Disabled</CommandItem>
          </CommandList>
        </Command>
      );

      const item = document.querySelector('[data-slot="command-item"]');
      expect(item).toHaveClass('data-[disabled=true]:pointer-events-none');
      expect(item).toHaveClass('data-[disabled=true]:opacity-50');
    });
  });
});

describe('CommandSeparator', () => {
  describe('Basic Rendering', () => {
    it('should render separator', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item 1</CommandItem>
            <CommandSeparator data-testid="separator" />
            <CommandItem>Item 2</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );

      const separator = document.querySelector('[data-slot="command-separator"]');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Separator Styling', () => {
    it('should have bg-border class', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );

      const separator = document.querySelector('[data-slot="command-separator"]');
      expect(separator).toHaveClass('bg-border');
    });

    it('should have -mx-1 class', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );

      const separator = document.querySelector('[data-slot="command-separator"]');
      expect(separator).toHaveClass('-mx-1');
    });

    it('should have h-px class', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator />
          </CommandList>
        </Command>
      );

      const separator = document.querySelector('[data-slot="command-separator"]');
      expect(separator).toHaveClass('h-px');
    });
  });
});

describe('CommandShortcut', () => {
  describe('Basic Rendering', () => {
    it('should render shortcut text', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Calendar
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('should have data-slot attribute', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Item
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = document.querySelector('[data-slot="command-shortcut"]');
      expect(shortcut).toBeInTheDocument();
    });
  });

  describe('Shortcut Styling', () => {
    it('should have text-muted-foreground class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Item
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = document.querySelector('[data-slot="command-shortcut"]');
      expect(shortcut).toHaveClass('text-muted-foreground');
    });

    it('should have ml-auto class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Item
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = document.querySelector('[data-slot="command-shortcut"]');
      expect(shortcut).toHaveClass('ml-auto');
    });

    it('should have text-xs class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Item
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = document.querySelector('[data-slot="command-shortcut"]');
      expect(shortcut).toHaveClass('text-xs');
    });

    it('should have tracking-widest class', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Item
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = document.querySelector('[data-slot="command-shortcut"]');
      expect(shortcut).toHaveClass('tracking-widest');
    });
  });
});

describe('Complete Command Menu', () => {
  it('should render complete command menu structure', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              Calendar
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Mail />
              Mail
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Configuration">
            <CommandItem>
              <Settings />
              Open Settings
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Open Settings')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should render multiple groups', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Recent">
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Favorites">
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
          <CommandGroup heading="All">
            <CommandItem>Item 3</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });
});
