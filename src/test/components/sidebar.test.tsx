import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/layout/sidebar';

// Mock next/navigation
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock navigation config
vi.mock('@/config/navigation', () => ({
  mainNavigation: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: () => <svg data-testid="icon-dashboard" />,
    },
    {
      title: 'Mapa',
      href: '/mapa',
      icon: () => <svg data-testid="icon-mapa" />,
    },
    {
      title: 'Análises',
      href: '/analise',
      icon: () => <svg data-testid="icon-analises" />,
      children: [
        { title: 'Criadouros', href: '/analise/criadouros', icon: () => <svg /> },
        { title: 'Devolutivas', href: '/analise/devolutivas', icon: () => <svg /> },
      ],
    },
    {
      title: 'Com Badge',
      href: '/badge',
      icon: () => <svg data-testid="icon-badge" />,
      badge: '5',
    },
  ],
  settingsNavigation: [
    {
      title: 'Configurações',
      href: '/configuracoes',
      icon: () => <svg data-testid="icon-settings" />,
    },
  ],
}));

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('should render sidebar', () => {
      render(<Sidebar />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render logo section', () => {
      render(<Sidebar />);

      expect(screen.getByText('TechDengue')).toBeInTheDocument();
      // Dashboard appears in both logo and nav, so use getAllByText
      const dashboards = screen.getAllByText('Dashboard');
      expect(dashboards.length).toBeGreaterThan(0);
    });

    it('should render navigation items', () => {
      render(<Sidebar />);

      // Use getAllByText for Dashboard since it appears multiple times
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      expect(screen.getByText('Mapa')).toBeInTheDocument();
      expect(screen.getByText('Análises')).toBeInTheDocument();
    });

    it('should render settings navigation', () => {
      render(<Sidebar />);

      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    it('should render footer with copyright', () => {
      render(<Sidebar />);

      expect(screen.getByText('© 2024 TechDengue')).toBeInTheDocument();
    });

    it('should render bug icon in logo', () => {
      const { container } = render(<Sidebar />);

      // Bug icon should be present
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Collapsed State', () => {
    it('should show full width when not collapsed', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should show narrow width when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should hide navigation text when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      // Dashboard text should not be visible (only the one in logo, which is also hidden)
      const dashboardButton = screen.queryByRole('button', { name: 'Dashboard' });
      expect(dashboardButton).not.toBeInTheDocument();
    });

    it('should hide logo text when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      // TechDengue text should not be visible
      expect(screen.queryByText('TechDengue')).not.toBeInTheDocument();
    });

    it('should hide footer when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      expect(screen.queryByText('© 2024 TechDengue')).not.toBeInTheDocument();
    });

    it('should still render icons when collapsed', () => {
      const { container } = render(<Sidebar isCollapsed={true} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Active State', () => {
    it('should highlight active route', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Sidebar />);

      // Find the Dashboard button - it should have active class
      const buttons = screen.getAllByRole('button');
      const dashboardButton = buttons.find(
        (btn) => btn.textContent?.includes('Dashboard')
      );
      expect(dashboardButton).toHaveClass('bg-primary/10');
    });

    it('should highlight nested active route', () => {
      mockPathname.mockReturnValue('/analise/criadouros');
      render(<Sidebar />);

      // Análises parent should be active
      const buttons = screen.getAllByRole('button');
      const analisesButton = buttons.find(
        (btn) => btn.textContent?.includes('Análises')
      );
      expect(analisesButton).toHaveClass('bg-primary/10');
    });
  });

  describe('Expandable Items', () => {
    it('should expand/collapse items with children', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      // Initially, children should not be visible
      expect(screen.queryByText('Criadouros')).not.toBeInTheDocument();

      // Click on Análises to expand
      const analisesButton = screen.getByRole('button', { name: /análises/i });
      await user.click(analisesButton);

      // Now children should be visible
      expect(screen.getByText('Criadouros')).toBeInTheDocument();
      expect(screen.getByText('Devolutivas')).toBeInTheDocument();
    });

    it('should toggle chevron icon on expand', async () => {
      const user = userEvent.setup();
      const { container } = render(<Sidebar />);

      const analisesButton = screen.getByRole('button', { name: /análises/i });

      // Find chevron icon (should not have rotate-180 initially)
      const chevronBefore = container.querySelector('.rotate-180');
      expect(chevronBefore).not.toBeInTheDocument();

      await user.click(analisesButton);

      // After click, chevron should have rotate-180
      const chevronAfter = container.querySelector('.rotate-180');
      expect(chevronAfter).toBeInTheDocument();
    });

    it('should not show children when collapsed', async () => {
      const user = userEvent.setup();
      render(<Sidebar isCollapsed={true} />);

      // Try to find and click Análises button (only icons visible)
      const buttons = screen.getAllByRole('button');
      const analisesButton = buttons[2]; // Third navigation item

      await user.click(analisesButton);

      // Children should not appear when collapsed
      expect(screen.queryByText('Criadouros')).not.toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('should show badge when provided', () => {
      render(<Sidebar />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should hide badge when collapsed', () => {
      render(<Sidebar isCollapsed={true} />);

      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('should have badge styling', () => {
      render(<Sidebar />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Links', () => {
    it('should render navigation items as links', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have correct href for links', () => {
      render(<Sidebar />);

      const dashboardLink = screen.getAllByRole('link').find(
        (link) => link.getAttribute('href') === '/dashboard'
      );
      expect(dashboardLink).toBeInTheDocument();
    });

    it('should have correct href for mapa', () => {
      render(<Sidebar />);

      const mapaLink = screen.getAllByRole('link').find(
        (link) => link.getAttribute('href') === '/mapa'
      );
      expect(mapaLink).toBeInTheDocument();
    });

    it('should have correct href for settings', () => {
      render(<Sidebar />);

      const settingsLink = screen.getAllByRole('link').find(
        (link) => link.getAttribute('href') === '/configuracoes'
      );
      expect(settingsLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role complementary for aside', () => {
      render(<Sidebar />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have navigation role for nav elements', () => {
      render(<Sidebar />);

      const navs = screen.getAllByRole('navigation');
      expect(navs.length).toBeGreaterThan(0);
    });

    it('should be focusable via keyboard', () => {
      render(<Sidebar />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Styling', () => {
    it('should have border-r class', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('border-r');
    });

    it('should have bg-card class', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('bg-card');
    });

    it('should have transition class', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('transition-all');
    });

    it('should have flex column layout', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('flex');
      expect(sidebar).toHaveClass('flex-col');
    });

    it('should have full height', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('h-full');
    });
  });

  describe('Default Props', () => {
    it('should be expanded by default', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-16');
    });
  });
});
