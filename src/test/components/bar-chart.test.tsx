import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChart } from '@/components/charts/bar-chart';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  BarChart: ({ children, data, layout, margin }: { children: React.ReactNode; data: unknown[]; layout?: string; margin?: object }) => (
    <div data-testid="bar-chart" data-layout={layout} data-length={data.length} data-margin={JSON.stringify(margin)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill, radius }: { dataKey: string; fill: string; radius?: number[] }) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} data-radius={JSON.stringify(radius)} />
  ),
  CartesianGrid: ({ strokeDasharray, horizontal }: { strokeDasharray: string; horizontal?: boolean }) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} data-horizontal={String(horizontal)} />
  ),
  XAxis: ({ dataKey, type, tickFormatter }: { dataKey?: string; type?: string; tickFormatter?: (value: number) => string }) => (
    <div data-testid="x-axis" data-key={dataKey} data-type={type} data-has-formatter={String(!!tickFormatter)} />
  ),
  YAxis: ({ dataKey, type, width, tickFormatter }: { dataKey?: string; type?: string; width?: number; tickFormatter?: (value: number) => string }) => (
    <div data-testid="y-axis" data-key={dataKey} data-type={type} data-width={width} data-has-formatter={String(!!tickFormatter)} />
  ),
  Tooltip: ({ contentStyle, formatter }: { contentStyle: object; formatter?: (value: number) => [string, string] }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} data-has-formatter={String(!!formatter)} />
  ),
}));

const mockData = [
  { name: 'Item A', value: 100 },
  { name: 'Item B', value: 200 },
  { name: 'Item C', value: 150 },
];

describe('BarChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render BarChart component', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render Bar component', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('bar')).toBeInTheDocument();
    });

    it('should render CartesianGrid', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render XAxis', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    });

    it('should render YAxis', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(<BarChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      render(<BarChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });

    it('should use default color #3b82f6', () => {
      render(<BarChart data={mockData} />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-fill', '#3b82f6');
    });

    it('should use vertical layout by default', () => {
      render(<BarChart data={mockData} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-layout', 'vertical');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom height', () => {
      render(<BarChart data={mockData} height={400} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });

    it('should accept custom color', () => {
      render(<BarChart data={mockData} color="#10b981" />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-fill', '#10b981');
    });
  });

  describe('Vertical Layout', () => {
    it('should have vertical layout attribute', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-layout', 'vertical');
    });

    it('should have XAxis with type number', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-type', 'number');
    });

    it('should have YAxis with type category', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-type', 'category');
    });

    it('should have YAxis dataKey as name', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-key', 'name');
    });

    it('should have horizontal CartesianGrid disabled', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const grid = screen.getByTestId('cartesian-grid');
      expect(grid).toHaveAttribute('data-horizontal', 'false');
    });
  });

  describe('Horizontal Layout', () => {
    it('should render horizontal layout when specified', () => {
      render(<BarChart data={mockData} layout="horizontal" />);

      const chart = screen.getByTestId('bar-chart');
      // Horizontal layout renders chart
      expect(chart).toBeInTheDocument();
    });

    it('should have XAxis with dataKey name', () => {
      render(<BarChart data={mockData} layout="horizontal" />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-key', 'name');
    });
  });

  describe('Data Handling', () => {
    it('should pass data to chart', () => {
      render(<BarChart data={mockData} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '3');
    });

    it('should handle empty data', () => {
      render(<BarChart data={[]} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      render(<BarChart data={[{ name: 'Single', value: 50 }]} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '1');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }));

      render(<BarChart data={largeData} />);

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '100');
    });
  });

  describe('Bar Configuration', () => {
    it('should have value as dataKey', () => {
      render(<BarChart data={mockData} />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-key', 'value');
    });

    it('should have radius for rounded corners', () => {
      render(<BarChart data={mockData} />);

      const bar = screen.getByTestId('bar');
      const radius = bar.getAttribute('data-radius');
      expect(radius).toBeTruthy();
      expect(JSON.parse(radius!)).toBeInstanceOf(Array);
    });
  });

  describe('Grid Configuration', () => {
    it('should have dashed stroke pattern', () => {
      render(<BarChart data={mockData} />);

      const grid = screen.getByTestId('cartesian-grid');
      expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3');
    });
  });

  describe('Tooltip Configuration', () => {
    it('should have formatter function', () => {
      render(<BarChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have custom style', () => {
      render(<BarChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      const style = JSON.parse(tooltip.getAttribute('data-style')!);
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius');
    });
  });

  describe('Axis Formatters', () => {
    it('should have formatter on XAxis for vertical layout', () => {
      render(<BarChart data={mockData} layout="vertical" />);

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have formatter on YAxis for horizontal layout', () => {
      render(<BarChart data={mockData} layout="horizontal" />);

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-has-formatter', 'true');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should have 100% width', () => {
      render(<BarChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
    });
  });

  describe('Color Variants', () => {
    it('should accept hex color', () => {
      render(<BarChart data={mockData} color="#ff0000" />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-fill', '#ff0000');
    });

    it('should accept any valid color string', () => {
      render(<BarChart data={mockData} color="rgb(255, 0, 0)" />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-fill', 'rgb(255, 0, 0)');
    });
  });
});
