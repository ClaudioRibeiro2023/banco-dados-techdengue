import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  BarChart: ({ children, data, margin }: { children: React.ReactNode; data: unknown[]; margin?: object }) => (
    <div data-testid="bar-chart" data-length={data.length} data-margin={JSON.stringify(margin)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, name, stackId, fill }: { dataKey: string; name: string; stackId: string; fill: string }) => (
    <div data-testid="bar" data-key={dataKey} data-name={name} data-stack-id={stackId} data-fill={fill} />
  ),
  CartesianGrid: ({ strokeDasharray }: { strokeDasharray: string }) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
    <div data-testid="y-axis" data-has-formatter={String(!!tickFormatter)} />
  ),
  Tooltip: ({ contentStyle, formatter }: { contentStyle: object; formatter?: (value: number) => string }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} data-has-formatter={String(!!formatter)} />
  ),
  Legend: ({ formatter }: { formatter?: (value: string) => React.ReactNode }) => (
    <div data-testid="legend" data-has-formatter={String(!!formatter)} />
  ),
}));

const mockCategories = [
  { key: 'category1', name: 'Category 1', color: '#10b981' },
  { key: 'category2', name: 'Category 2', color: '#3b82f6' },
  { key: 'category3', name: 'Category 3', color: '#f59e0b' },
];

const mockData = [
  { month: 'Jan', category1: 100, category2: 200, category3: 150 },
  { month: 'Feb', category1: 120, category2: 180, category3: 160 },
  { month: 'Mar', category1: 140, category2: 220, category3: 140 },
];

describe('StackedBarChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render BarChart component', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render CartesianGrid', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render XAxis', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    });

    it('should render YAxis', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render Legend', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Bar Components', () => {
    it('should render one Bar per category', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars).toHaveLength(3);
    });

    it('should have correct dataKeys for each bar', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars[0]).toHaveAttribute('data-key', 'category1');
      expect(bars[1]).toHaveAttribute('data-key', 'category2');
      expect(bars[2]).toHaveAttribute('data-key', 'category3');
    });

    it('should have correct names for each bar', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars[0]).toHaveAttribute('data-name', 'Category 1');
      expect(bars[1]).toHaveAttribute('data-name', 'Category 2');
      expect(bars[2]).toHaveAttribute('data-name', 'Category 3');
    });

    it('should have correct colors for each bar', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars[0]).toHaveAttribute('data-fill', '#10b981');
      expect(bars[1]).toHaveAttribute('data-fill', '#3b82f6');
      expect(bars[2]).toHaveAttribute('data-fill', '#f59e0b');
    });

    it('should have same stackId for all bars', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      bars.forEach((bar) => {
        expect(bar).toHaveAttribute('data-stack-id', 'a');
      });
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom height', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
          height={400}
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });
  });

  describe('XAxis Configuration', () => {
    it('should use xAxisKey for XAxis dataKey', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-key', 'month');
    });

    it('should accept different xAxisKey', () => {
      const dataWithDate = [
        { date: '2024-01', category1: 100 },
        { date: '2024-02', category1: 120 },
      ];

      render(
        <StackedBarChart
          data={dataWithDate}
          categories={[{ key: 'category1', name: 'Cat 1', color: '#000' }]}
          xAxisKey="date"
        />
      );

      const xAxis = screen.getByTestId('x-axis');
      expect(xAxis).toHaveAttribute('data-key', 'date');
    });
  });

  describe('Data Handling', () => {
    it('should pass data to chart', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '3');
    });

    it('should handle empty data', () => {
      render(
        <StackedBarChart
          data={[]}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      render(
        <StackedBarChart
          data={[{ month: 'Jan', category1: 100 }]}
          categories={[{ key: 'category1', name: 'Cat 1', color: '#000' }]}
          xAxisKey="month"
        />
      );

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '1');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        category1: Math.random() * 100,
        category2: Math.random() * 100,
      }));

      render(
        <StackedBarChart
          data={largeData}
          categories={[
            { key: 'category1', name: 'Cat 1', color: '#000' },
            { key: 'category2', name: 'Cat 2', color: '#fff' },
          ]}
          xAxisKey="month"
        />
      );

      const chart = screen.getByTestId('bar-chart');
      expect(chart).toHaveAttribute('data-length', '12');
    });
  });

  describe('Categories Configuration', () => {
    it('should handle single category', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={[{ key: 'category1', name: 'Single Category', color: '#10b981' }]}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars).toHaveLength(1);
    });

    it('should handle many categories', () => {
      const manyCategories = Array.from({ length: 10 }, (_, i) => ({
        key: `cat${i}`,
        name: `Category ${i}`,
        color: `#${i.toString().padStart(6, '0')}`,
      }));

      render(
        <StackedBarChart
          data={mockData}
          categories={manyCategories}
          xAxisKey="month"
        />
      );

      const bars = screen.getAllByTestId('bar');
      expect(bars).toHaveLength(10);
    });
  });

  describe('Grid Configuration', () => {
    it('should have dashed stroke pattern', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const grid = screen.getByTestId('cartesian-grid');
      expect(grid).toHaveAttribute('data-stroke-dasharray', '3 3');
    });
  });

  describe('Tooltip Configuration', () => {
    it('should have formatter function', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have custom style', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      const style = JSON.parse(tooltip.getAttribute('data-style')!);
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius', '6px');
    });
  });

  describe('Legend Configuration', () => {
    it('should have formatter function', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const legend = screen.getByTestId('legend');
      expect(legend).toHaveAttribute('data-has-formatter', 'true');
    });
  });

  describe('YAxis Configuration', () => {
    it('should have tick formatter', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const yAxis = screen.getByTestId('y-axis');
      expect(yAxis).toHaveAttribute('data-has-formatter', 'true');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should have 100% width', () => {
      render(
        <StackedBarChart
          data={mockData}
          categories={mockCategories}
          xAxisKey="month"
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
    });
  });
});
