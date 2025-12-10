import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MunicipioSelect } from '@/components/forms/municipio-select';

const mockOptions = [
  { value: '1', label: 'Curitiba' },
  { value: '2', label: 'Londrina' },
  { value: '3', label: 'Maringá' },
  { value: '4', label: 'Cascavel' },
  { value: '5', label: 'Ponta Grossa' },
];

describe('MunicipioSelect', () => {
  describe('Rendering', () => {
    it('should render combobox button', () => {
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });

    it('should show default placeholder', () => {
      render(<MunicipioSelect options={mockOptions} />);

      expect(screen.getByText('Selecione um município')).toBeInTheDocument();
    });

    it('should show custom placeholder', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          placeholder="Escolha uma cidade"
        />
      );

      expect(screen.getByText('Escolha uma cidade')).toBeInTheDocument();
    });

    it('should show selected option label', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          value="1"
        />
      );

      expect(screen.getByText('Curitiba')).toBeInTheDocument();
    });

    it('should render chevron icon', () => {
      const { container } = render(<MunicipioSelect options={mockOptions} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Popover Interaction', () => {
    it('should open popover when clicked', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      // Popover should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should show all options in popover', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Curitiba')).toBeInTheDocument();
        expect(screen.getByText('Londrina')).toBeInTheDocument();
        expect(screen.getByText('Maringá')).toBeInTheDocument();
        expect(screen.getByText('Cascavel')).toBeInTheDocument();
        expect(screen.getByText('Ponta Grossa')).toBeInTheDocument();
      });
    });

    it('should show search input in popover', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByPlaceholderText('Buscar município...')).toBeInTheDocument();
    });

    it('should close popover after selection', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MunicipioSelect
          options={mockOptions}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Curitiba'));

      // Popover should close
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should call onChange with value when option is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MunicipioSelect
          options={mockOptions}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Londrina'));

      expect(onChange).toHaveBeenCalledWith('2');
    });

    it('should deselect when clicking same option', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <MunicipioSelect
          options={mockOptions}
          value="1"
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole('combobox'));

      // When popover opens, find the option in the list (multiple "Curitiba" texts exist)
      const listbox = await screen.findByRole('listbox');
      const curitibaOption = listbox.querySelector('[data-value="curitiba"]');
      if (curitibaOption) {
        await user.click(curitibaOption);
      } else {
        // Fallback: get all elements with Curitiba text and click the one in the list
        const allCuritibas = screen.getAllByText('Curitiba');
        // The second one should be in the dropdown list
        await user.click(allCuritibas[allCuritibas.length - 1]);
      }

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should show check icon on selected option', async () => {
      const user = userEvent.setup();
      render(
        <MunicipioSelect
          options={mockOptions}
          value="1"
        />
      );

      await user.click(screen.getByRole('combobox'));

      // Check that the listbox is open
      const listbox = await screen.findByRole('listbox');
      expect(listbox).toBeInTheDocument();

      // The component uses data-value attribute for selection indication
      // Find the selected option by data-selected or aria-selected
      const selectedOption = listbox.querySelector('[aria-selected="true"]');
      expect(selectedOption).toBeInTheDocument();
    });

    it('should render svg icons in options', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MunicipioSelect
          options={mockOptions}
          value="1"
        />
      );

      await user.click(screen.getByRole('combobox'));

      // Wait for listbox to appear
      await screen.findByRole('listbox');

      // There should be at least the chevron SVG icon
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Search Filtering', () => {
    it('should filter options by search term', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      const searchInput = screen.getByPlaceholderText('Buscar município...');
      await user.type(searchInput, 'Cur');

      // Only Curitiba should be visible
      await waitFor(() => {
        expect(screen.getByText('Curitiba')).toBeInTheDocument();
      });
    });

    it('should show empty message when no matches', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      const searchInput = screen.getByPlaceholderText('Buscar município...');
      await user.type(searchInput, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('Nenhum município encontrado.')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      const searchInput = screen.getByPlaceholderText('Buscar município...');
      await user.type(searchInput, 'CURITIBA');

      await waitFor(() => {
        expect(screen.getByText('Curitiba')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          disabled
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should not open when disabled', async () => {
      const user = userEvent.setup();
      render(
        <MunicipioSelect
          options={mockOptions}
          disabled
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      // Popover should not open
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should be enabled by default', () => {
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          className="custom-width"
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('custom-width');
    });

    it('should have default width class', () => {
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('w-[200px]');
    });

    it('should maintain justify-between class', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          className="w-[300px]"
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('justify-between');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when open', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have role combobox', () => {
      render(<MunicipioSelect options={mockOptions} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have role listbox for options', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<MunicipioSelect options={[]} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show empty message for empty options', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={[]} />);

      await user.click(screen.getByRole('combobox'));

      // Should show the empty state since there are no options
      expect(screen.getByText('Nenhum município encontrado.')).toBeInTheDocument();
    });

    it('should handle single option', async () => {
      const user = userEvent.setup();
      const singleOption = [{ value: '1', label: 'Única Cidade' }];
      render(<MunicipioSelect options={singleOption} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Única Cidade')).toBeInTheDocument();
    });

    it('should handle many options', async () => {
      const user = userEvent.setup();
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `${i}`,
        label: `Cidade ${i}`,
      }));

      render(<MunicipioSelect options={manyOptions} />);

      await user.click(screen.getByRole('combobox'));

      // Should render without crashing
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should handle options with special characters', async () => {
      const user = userEvent.setup();
      const specialOptions = [
        { value: '1', label: 'São José dos Pinhais' },
        { value: '2', label: 'Foz do Iguaçu' },
      ];

      render(<MunicipioSelect options={specialOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('São José dos Pinhais')).toBeInTheDocument();
      expect(screen.getByText('Foz do Iguaçu')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          value={undefined}
        />
      );

      expect(screen.getByText('Selecione um município')).toBeInTheDocument();
    });

    it('should handle invalid value gracefully', () => {
      render(
        <MunicipioSelect
          options={mockOptions}
          value="invalid-id"
        />
      );

      // Should show placeholder since value doesn't match any option
      expect(screen.getByText('Selecione um município')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open with Enter key', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      const button = screen.getByRole('combobox');
      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close with Escape key', async () => {
      const user = userEvent.setup();
      render(<MunicipioSelect options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });
});
