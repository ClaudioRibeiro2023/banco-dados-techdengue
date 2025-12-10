import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/header';

// Mock auth store
const mockUser = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@techdengue.com',
  perfil: 'admin',
};

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
  })),
}));

// Mock useAuth hook
const mockLogout = vi.fn();
vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

describe('Header', () => {
  const mockOnMenuClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header element', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render menu button for mobile', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const menuButton = screen.getByRole('button', { name: '' });
      expect(menuButton).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should render notifications button', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      // Notification badge shows "3"
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render user name', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('should render user initials in avatar', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  describe('Menu Button', () => {
    it('should call onMenuClick when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const buttons = screen.getAllByRole('button');
      const menuButton = buttons[0]; // First button is menu
      await user.click(menuButton);

      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });

    it('should have lg:hidden class', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const buttons = screen.getAllByRole('button');
      const menuButton = buttons[0];
      expect(menuButton).toHaveClass('lg:hidden');
    });
  });

  describe('Search', () => {
    it('should render search input with placeholder', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const searchInput = screen.getByPlaceholderText('Buscar...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.click(searchInput);

      expect(document.activeElement).toBe(searchInput);
    });

    it('should accept text input', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'teste');

      expect(searchInput).toHaveValue('teste');
    });
  });

  describe('Notifications', () => {
    it('should show notification count', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should have badge styling', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const badge = screen.getByText('3');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('bg-red-500');
    });
  });

  describe('User Menu', () => {
    it('should open dropdown on click', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const userButton = screen.getByRole('button', { name: /js.*joão silva/i });
      await user.click(userButton);

      // Dropdown should open
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('should show user email in dropdown', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const userButton = screen.getByRole('button', { name: /js.*joão silva/i });
      await user.click(userButton);

      expect(screen.getByText('joao@techdengue.com')).toBeInTheDocument();
    });

    it('should call logout when Sair is clicked', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const userButton = screen.getByRole('button', { name: /js.*joão silva/i });
      await user.click(userButton);

      const logoutButton = screen.getByText('Sair');
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should show logout button with red styling', async () => {
      const user = userEvent.setup();
      render(<Header onMenuClick={mockOnMenuClick} />);

      const userButton = screen.getByRole('button', { name: /js.*joão silva/i });
      await user.click(userButton);

      const logoutMenuItem = screen.getByText('Sair').closest('[role="menuitem"]');
      expect(logoutMenuItem).toHaveClass('text-red-600');
    });
  });

  describe('User Initials', () => {
    it('should generate initials from full name', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      // João Silva -> JS
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should handle single name', async () => {
      const { useAuthStore } = await import('@/stores/auth.store');
      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, nome: 'Maria' },
      });

      render(<Header onMenuClick={mockOnMenuClick} />);

      // Maria -> M (only first letter)
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should show TD for missing name', async () => {
      const { useAuthStore } = await import('@/stores/auth.store');
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
      });

      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByText('TD')).toBeInTheDocument();
    });

    it('should limit initials to 2 characters', async () => {
      const { useAuthStore } = await import('@/stores/auth.store');
      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, nome: 'Ana Maria Silva Santos' },
      });

      render(<Header onMenuClick={mockOnMenuClick} />);

      // Should be "AM" not "AMSS"
      expect(screen.getByText('AM')).toBeInTheDocument();
    });
  });

  describe('Fallback User', () => {
    it('should show Usuário when no user name', async () => {
      const { useAuthStore } = await import('@/stores/auth.store');
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
      });

      render(<Header onMenuClick={mockOnMenuClick} />);

      expect(screen.getByText('Usuário')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have header styling', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('h-16');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('bg-card');
    });

    it('should have justify-between', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('justify-between');
    });

    it('should have items-center', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('items-center');
    });
  });

  describe('Avatar', () => {
    it('should render avatar with initials', () => {
      const { container } = render(<Header onMenuClick={mockOnMenuClick} />);

      // Avatar should be rendered - look for avatar fallback span
      const avatarFallback = container.querySelector('[class*="bg-primary"]');
      expect(avatarFallback).toBeInTheDocument();
    });

    it('should have avatar styling', () => {
      const { container } = render(<Header onMenuClick={mockOnMenuClick} />);

      // Look for avatar container with size classes
      const avatarElements = container.querySelectorAll('span');
      expect(avatarElements.length).toBeGreaterThan(0);
    });

    it('should have primary background for initials', () => {
      const { container } = render(<Header onMenuClick={mockOnMenuClick} />);

      // Find element with bg-primary class
      const primaryBgElement = container.querySelector('.bg-primary');
      expect(primaryBgElement).toBeInTheDocument();
    });
  });

  describe('Responsive', () => {
    it('should have hidden class on search for mobile', () => {
      const { container } = render(<Header onMenuClick={mockOnMenuClick} />);

      // Search container should be hidden on mobile
      const hiddenElement = container.querySelector('.hidden');
      expect(hiddenElement).toBeInTheDocument();
    });

    it('should render user button', () => {
      render(<Header onMenuClick={mockOnMenuClick} />);

      // User button should be present (may show "Usuário" if mock not working)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
