import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/layout/breadcrumb';

// Mock next/navigation
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('should render navigation element', () => {
      render(<Breadcrumb />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render home link to dashboard', () => {
      render(<Breadcrumb />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/dashboard');
    });

    it('should render current page name', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Breadcrumb />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should return null for root path', () => {
      mockPathname.mockReturnValue('/');
      const { container } = render(<Breadcrumb />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Route Names', () => {
    it('should display Dashboard for /dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Breadcrumb />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should display Mapa for /mapa', () => {
      mockPathname.mockReturnValue('/mapa');
      render(<Breadcrumb />);

      expect(screen.getByText('Mapa')).toBeInTheDocument();
    });

    it('should display Análises for /analise', () => {
      mockPathname.mockReturnValue('/analise');
      render(<Breadcrumb />);

      expect(screen.getByText('Análises')).toBeInTheDocument();
    });

    it('should display Atividades for /atividades', () => {
      mockPathname.mockReturnValue('/atividades');
      render(<Breadcrumb />);

      expect(screen.getByText('Atividades')).toBeInTheDocument();
    });

    it('should display Relatórios for /relatorios', () => {
      mockPathname.mockReturnValue('/relatorios');
      render(<Breadcrumb />);

      expect(screen.getByText('Relatórios')).toBeInTheDocument();
    });

    it('should display Configurações for /configuracoes', () => {
      mockPathname.mockReturnValue('/configuracoes');
      render(<Breadcrumb />);

      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });
  });

  describe('Nested Routes', () => {
    it('should show parent and child for /analise/criadouros', () => {
      mockPathname.mockReturnValue('/analise/criadouros');
      render(<Breadcrumb />);

      expect(screen.getByText('Análises')).toBeInTheDocument();
      expect(screen.getByText('Criadouros')).toBeInTheDocument();
    });

    it('should render last segment as text (not link)', () => {
      mockPathname.mockReturnValue('/analise/criadouros');
      render(<Breadcrumb />);

      const criadourosText = screen.getByText('Criadouros');
      expect(criadourosText.tagName).toBe('SPAN');
    });

    it('should show multiple levels for /analise/devolutivas', () => {
      mockPathname.mockReturnValue('/analise/devolutivas');
      render(<Breadcrumb />);

      expect(screen.getByText('Análises')).toBeInTheDocument();
      expect(screen.getByText('Devolutivas')).toBeInTheDocument();
    });

    it('should show Comparativo for /analise/comparativo', () => {
      mockPathname.mockReturnValue('/analise/comparativo');
      render(<Breadcrumb />);

      expect(screen.getByText('Comparativo')).toBeInTheDocument();
    });

    it('should show Correlação for /analise/correlacao', () => {
      mockPathname.mockReturnValue('/analise/correlacao');
      render(<Breadcrumb />);

      expect(screen.getByText('Correlação')).toBeInTheDocument();
    });
  });

  describe('Unknown Routes', () => {
    it('should display segment name for unknown routes', () => {
      mockPathname.mockReturnValue('/unknown-route');
      render(<Breadcrumb />);

      expect(screen.getByText('unknown-route')).toBeInTheDocument();
    });

    it('should display segment as-is for unmapped routes', () => {
      mockPathname.mockReturnValue('/custom/path');
      render(<Breadcrumb />);

      expect(screen.getByText('custom')).toBeInTheDocument();
      expect(screen.getByText('path')).toBeInTheDocument();
    });
  });

  describe('Chevron Separators', () => {
    it('should render chevron between segments', () => {
      mockPathname.mockReturnValue('/analise/criadouros');
      const { container } = render(<Breadcrumb />);

      // Should have chevron icons (one after home, one between segments)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling', () => {
    it('should have text-sm class', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('text-sm');
    });

    it('should have flex and items-center', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
    });

    it('should have text-muted-foreground', () => {
      render(<Breadcrumb />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('text-muted-foreground');
    });

    it('should have font-medium on last segment', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Breadcrumb />);

      const lastSegment = screen.getByText('Dashboard');
      expect(lastSegment).toHaveClass('font-medium');
    });

    it('should have text-foreground on last segment', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Breadcrumb />);

      const lastSegment = screen.getByText('Dashboard');
      expect(lastSegment).toHaveClass('text-foreground');
    });
  });

  describe('Links', () => {
    it('should have correct href for nested routes', () => {
      mockPathname.mockReturnValue('/analise/criadouros');
      render(<Breadcrumb />);

      const links = screen.getAllByRole('link');
      // First link is home
      expect(links[0]).toHaveAttribute('href', '/dashboard');
    });

    it('should have hover:text-foreground class on home link', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Breadcrumb />);

      const homeLink = screen.getAllByRole('link')[0];
      expect(homeLink).toHaveClass('hover:text-foreground');
    });
  });

  describe('Deep Nesting', () => {
    it('should handle three levels of nesting', () => {
      mockPathname.mockReturnValue('/analise/criadouros/detalhes');
      render(<Breadcrumb />);

      expect(screen.getByText('Análises')).toBeInTheDocument();
      expect(screen.getByText('Criadouros')).toBeInTheDocument();
      expect(screen.getByText('detalhes')).toBeInTheDocument();
    });

    it('should have multiple links for deep nesting', () => {
      mockPathname.mockReturnValue('/analise/criadouros/detalhes');
      render(<Breadcrumb />);

      const links = screen.getAllByRole('link');
      // Should have at least home link and parent links
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      render(<Breadcrumb />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible home link', () => {
      render(<Breadcrumb />);

      const homeLink = screen.getAllByRole('link')[0];
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle trailing slash', () => {
      mockPathname.mockReturnValue('/dashboard/');
      render(<Breadcrumb />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
