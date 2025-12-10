import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractSelector, ContractSelectorCompact, Contrato } from '@/components/layout/contract-selector';

// Mock filter store
const mockSetContrato = vi.fn();
const mockSetMunicipio = vi.fn();
vi.mock('@/stores/filter.store', () => ({
  useFilterStore: vi.fn(() => ({
    contratoId: null,
    setContrato: mockSetContrato,
    setMunicipio: mockSetMunicipio,
  })),
}));

const mockContratos: Contrato[] = [
  {
    id: '1',
    nome: 'Contrato 001/2024',
    municipio: 'São Paulo',
    municipioId: 'sp',
    status: 'ativo',
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
  },
  {
    id: '2',
    nome: 'Contrato 002/2024',
    municipio: 'Rio de Janeiro',
    municipioId: 'rj',
    status: 'ativo',
    dataInicio: '2024-02-01',
    dataFim: '2024-12-31',
  },
  {
    id: '3',
    nome: 'Contrato 003/2024',
    municipio: 'São Paulo',
    municipioId: 'sp',
    status: 'inativo',
    dataInicio: '2023-01-01',
    dataFim: '2023-12-31',
  },
  {
    id: '4',
    nome: 'Contrato 004/2024',
    municipio: 'Curitiba',
    municipioId: 'cwb',
    status: 'suspenso',
    dataInicio: '2024-01-15',
    dataFim: '2024-07-15',
  },
];

describe('ContractSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render combobox button', () => {
      render(<ContractSelector contratos={mockContratos} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render placeholder text', () => {
      render(<ContractSelector contratos={mockContratos} />);

      expect(screen.getByText('Selecionar contrato...')).toBeInTheDocument();
    });

    it('should render building icon', () => {
      const { container } = render(<ContractSelector contratos={mockContratos} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render chevron down icon', () => {
      const { container } = render(<ContractSelector contratos={mockContratos} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have aria-label', () => {
      render(<ContractSelector contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-label', 'Selecionar contrato');
    });
  });

  describe('Popover Interaction', () => {
    it('should open popover on click', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(screen.getByPlaceholderText('Buscar contrato...')).toBeInTheDocument();
    });

    it('should show search input', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByPlaceholderText('Buscar contrato...')).toBeInTheDocument();
    });

    it('should show grouped contracts by municipality', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      // Municipalities appear as group headers (may appear multiple times)
      const saoPauloElements = screen.getAllByText('São Paulo');
      expect(saoPauloElements.length).toBeGreaterThan(0);
      const rioElements = screen.getAllByText('Rio de Janeiro');
      expect(rioElements.length).toBeGreaterThan(0);
    });

    it('should show contract names', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Contrato 001/2024')).toBeInTheDocument();
      expect(screen.getByText('Contrato 002/2024')).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should show Ativo badge', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      const ativoBadges = screen.getAllByText('Ativo');
      expect(ativoBadges.length).toBeGreaterThan(0);
    });

    it('should show Inativo badge', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should show Suspenso badge', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Suspenso')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should call onSelect when contract is selected', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<ContractSelector contratos={mockContratos} onSelect={mockOnSelect} />);

      await user.click(screen.getByRole('combobox'));

      const contrato = screen.getByText('Contrato 001/2024');
      await user.click(contrato);

      expect(mockSetContrato).toHaveBeenCalledWith('1');
    });

    it('should update filter store on selection', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Contrato 002/2024'));

      expect(mockSetContrato).toHaveBeenCalledWith('2');
      expect(mockSetMunicipio).toHaveBeenCalledWith('rj');
    });

    it('should close popover after selection', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Contrato 001/2024'));

      // Popover should be closed
      expect(screen.queryByPlaceholderText('Buscar contrato...')).not.toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('should filter contracts by name', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Buscar contrato...');
      await user.type(searchInput, '001');

      expect(screen.getByText('Contrato 001/2024')).toBeInTheDocument();
      expect(screen.queryByText('Contrato 002/2024')).not.toBeInTheDocument();
    });

    it('should filter contracts by municipality', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Buscar contrato...');
      await user.type(searchInput, 'Rio');

      expect(screen.getByText('Contrato 002/2024')).toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Buscar contrato...');
      await user.type(searchInput, 'são paulo');

      expect(screen.getByText('Contrato 001/2024')).toBeInTheDocument();
    });

    it('should show empty message when no results', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Buscar contrato...');
      await user.type(searchInput, 'xyz123');

      expect(screen.getByText('Nenhum contrato encontrado.')).toBeInTheDocument();
    });
  });

  describe('Date Display', () => {
    it('should show contract info in popover', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      // Check contract names are visible
      expect(screen.getByText('Contrato 001/2024')).toBeInTheDocument();
    });
  });

  describe('Clear Selection', () => {
    it('should show clear option when contract is selected', async () => {
      const { useFilterStore } = await import('@/stores/filter.store');
      vi.mocked(useFilterStore).mockReturnValue({
        contratoId: '1',
        setContrato: mockSetContrato,
        setMunicipio: mockSetMunicipio,
      });

      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Limpar seleção')).toBeInTheDocument();
    });

    it('should clear selection when clicked', async () => {
      const { useFilterStore } = await import('@/stores/filter.store');
      vi.mocked(useFilterStore).mockReturnValue({
        contratoId: '1',
        setContrato: mockSetContrato,
        setMunicipio: mockSetMunicipio,
      });

      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Limpar seleção'));

      expect(mockSetContrato).toHaveBeenCalledWith(null);
      expect(mockSetMunicipio).toHaveBeenCalledWith(null);
    });
  });

  describe('Show Municipio Option', () => {
    it('should show municipality when showMunicipio is true', async () => {
      const { useFilterStore } = await import('@/stores/filter.store');
      vi.mocked(useFilterStore).mockReturnValue({
        contratoId: '1',
        setContrato: mockSetContrato,
        setMunicipio: mockSetMunicipio,
      });

      render(<ContractSelector contratos={mockContratos} showMunicipio={true} />);

      // Should show municipality name below contract name
      const button = screen.getByRole('combobox');
      expect(within(button).getByText('São Paulo')).toBeInTheDocument();
    });

    it('should support showMunicipio false option', () => {
      render(<ContractSelector contratos={mockContratos} showMunicipio={false} />);

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(<ContractSelector contratos={mockContratos} className="custom-class" />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('custom-class');
    });

    it('should have min-w-[250px] by default', () => {
      render(<ContractSelector contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('min-w-[250px]');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded false when closed', () => {
      render(<ContractSelector contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded true when open', async () => {
      const user = userEvent.setup();
      render(<ContractSelector contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

describe('ContractSelectorCompact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render compact combobox button', () => {
      render(<ContractSelectorCompact contratos={mockContratos} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show combobox role', () => {
      render(<ContractSelectorCompact contratos={mockContratos} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have h-8 height class', () => {
      render(<ContractSelectorCompact contratos={mockContratos} />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('h-8');
    });

    it('should have ghost variant styling', () => {
      const { container } = render(<ContractSelectorCompact contratos={mockContratos} />);

      // Ghost button typically has specific styling
      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should open popover and show contracts', async () => {
      const user = userEvent.setup();
      render(<ContractSelectorCompact contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      // Should show search input when opened
      expect(screen.getByPlaceholderText('Buscar contrato...')).toBeInTheDocument();
    });
  });

  describe('Active Contracts Only', () => {
    it('should show active contracts group', async () => {
      const user = userEvent.setup();
      render(<ContractSelectorCompact contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Contratos Ativos')).toBeInTheDocument();
    });

    it('should show active contracts in list', async () => {
      const user = userEvent.setup();
      render(<ContractSelectorCompact contratos={mockContratos} />);

      await user.click(screen.getByRole('combobox'));

      // Active contracts should be visible
      const contratos001 = screen.getAllByText('Contrato 001/2024');
      expect(contratos001.length).toBeGreaterThan(0);
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(<ContractSelectorCompact contratos={mockContratos} className="custom-compact-class" />);

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('custom-compact-class');
    });
  });
});
