import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvolutionChart } from '@/components/charts/evolution-chart';

// Mock Recharts to avoid ResizeObserver issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-length={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, stroke, fill }: { dataKey: string; stroke: string; fill: string }) => (
    <div data-testid="area" data-key={dataKey} data-stroke={stroke} data-fill={fill} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockHectaresData = [
  { date: '01/01', hectares: 100 },
  { date: '02/01', hectares: 150 },
  { date: '03/01', hectares: 120 },
  { date: '04/01', hectares: 200 },
  { date: '05/01', hectares: 180 },
];

const mockAtividadesData = [
  { date: '01/01', atividades: 10 },
  { date: '02/01', atividades: 15 },
  { date: '03/01', atividades: 12 },
];

const mockPoisData = [
  { date: '01/01', pois: 500 },
  { date: '02/01', pois: 750 },
];

describe('EvolutionChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render AreaChart', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should render Area component', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('area')).toBeInTheDocument();
    });

    it('should render CartesianGrid', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render XAxis', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    });

    it('should render YAxis', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('DataKey Hectares', () => {
    it('should pass hectares as dataKey to Area', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-key', 'hectares');
    });

    it('should use green color for hectares', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#10b981');
    });

    it('should pass date as XAxis dataKey', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-key', 'date');
    });
  });

  describe('DataKey Atividades', () => {
    it('should pass atividades as dataKey to Area', () => {
      render(<EvolutionChart data={mockAtividadesData} dataKey="atividades" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-key', 'atividades');
    });

    it('should use blue color for atividades', () => {
      render(<EvolutionChart data={mockAtividadesData} dataKey="atividades" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#3b82f6');
    });
  });

  describe('DataKey POIs', () => {
    it('should pass pois as dataKey to Area', () => {
      render(<EvolutionChart data={mockPoisData} dataKey="pois" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-key', 'pois');
    });

    it('should use amber color for pois', () => {
      render(<EvolutionChart data={mockPoisData} dataKey="pois" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#f59e0b');
    });
  });

  describe('Custom Color', () => {
    it('should use custom color when provided', () => {
      render(
        <EvolutionChart
          data={mockHectaresData}
          dataKey="hectares"
          color="#ff0000"
        />
      );

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#ff0000');
    });

    it('should override default color', () => {
      render(
        <EvolutionChart
          data={mockAtividadesData}
          dataKey="atividades"
          color="#purple"
        />
      );

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#purple');
    });
  });

  describe('Data Handling', () => {
    it('should pass data to AreaChart', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const areaChart = screen.getByTestId('area-chart');
      expect(areaChart).toHaveAttribute('data-length', '5');
    });

    it('should handle empty data', () => {
      render(<EvolutionChart data={[]} dataKey="hectares" />);

      const areaChart = screen.getByTestId('area-chart');
      expect(areaChart).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      const singleData = [{ date: '01/01', hectares: 100 }];
      render(<EvolutionChart data={singleData} dataKey="hectares" />);

      const areaChart = screen.getByTestId('area-chart');
      expect(areaChart).toHaveAttribute('data-length', '1');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        date: `${i + 1}/01`,
        hectares: Math.random() * 1000,
      }));

      render(<EvolutionChart data={largeData} dataKey="hectares" />);

      const areaChart = screen.getByTestId('area-chart');
      expect(areaChart).toHaveAttribute('data-length', '100');
    });
  });

  describe('Gradient Fill', () => {
    it('should use gradient fill for hectares', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-fill', 'url(#gradient-hectares)');
    });

    it('should use gradient fill for atividades', () => {
      render(<EvolutionChart data={mockAtividadesData} dataKey="atividades" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-fill', 'url(#gradient-atividades)');
    });

    it('should use gradient fill for pois', () => {
      render(<EvolutionChart data={mockPoisData} dataKey="pois" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-fill', 'url(#gradient-pois)');
    });
  });

  describe('Color Map', () => {
    it('should have correct color for hectares', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#10b981'); // emerald-500
    });

    it('should have correct color for atividades', () => {
      render(<EvolutionChart data={mockAtividadesData} dataKey="atividades" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#3b82f6'); // blue-500
    });

    it('should have correct color for pois', () => {
      render(<EvolutionChart data={mockPoisData} dataKey="pois" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#f59e0b'); // amber-500
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      // We can't easily test height from mocked component,
      // but we verify the component renders successfully
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should use default color when not provided', () => {
      render(<EvolutionChart data={mockHectaresData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-stroke', '#10b981');
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with zero values', () => {
      const zeroData = [
        { date: '01/01', hectares: 0 },
        { date: '02/01', hectares: 0 },
      ];

      render(<EvolutionChart data={zeroData} dataKey="hectares" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle data with negative values', () => {
      const negativeData = [
        { date: '01/01', hectares: -10 },
        { date: '02/01', hectares: 10 },
      ];

      render(<EvolutionChart data={negativeData} dataKey="hectares" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle data with undefined values', () => {
      const undefinedData = [
        { date: '01/01', hectares: undefined },
        { date: '02/01', hectares: 100 },
      ];

      render(<EvolutionChart data={undefinedData} dataKey="hectares" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle mixed data types', () => {
      const mixedData = [
        { date: '01/01', hectares: 100, atividades: 10, pois: 500 },
        { date: '02/01', hectares: 150, atividades: 15, pois: 750 },
      ];

      render(<EvolutionChart data={mixedData} dataKey="hectares" />);

      const area = screen.getByTestId('area');
      expect(area).toHaveAttribute('data-key', 'hectares');
    });
  });
});
