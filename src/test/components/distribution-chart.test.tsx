import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistributionChart } from '@/components/charts/distribution-chart';

// Mock Recharts to avoid ResizeObserver issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, height }: { children: React.ReactNode; height: number }) => (
    <div data-testid="responsive-container" data-height={height}>
      {children}
    </div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({
    children,
    data,
    innerRadius,
    outerRadius,
  }: {
    children: React.ReactNode;
    data: unknown[];
    innerRadius: number;
    outerRadius: number;
  }) => (
    <div
      data-testid="pie"
      data-length={data.length}
      data-inner-radius={innerRadius}
      data-outer-radius={outerRadius}
    >
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockDistributionData = [
  { name: 'Pneu', value: 150 },
  { name: 'Vaso', value: 100 },
  { name: 'Lata', value: 75 },
  { name: 'Caixa D\'água', value: 50 },
];

const mockDataWithColors = [
  { name: 'Tipo A', value: 100, color: '#ff0000' },
  { name: 'Tipo B', value: 200, color: '#00ff00' },
  { name: 'Tipo C', value: 150, color: '#0000ff' },
];

describe('DistributionChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(<DistributionChart data={mockDistributionData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render PieChart', () => {
      render(<DistributionChart data={mockDistributionData} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should render Pie component', () => {
      render(<DistributionChart data={mockDistributionData} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(<DistributionChart data={mockDistributionData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render Legend', () => {
      render(<DistributionChart data={mockDistributionData} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('should render Cell for each data point', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(4);
    });
  });

  describe('Data Handling', () => {
    it('should pass data length to Pie', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '4');
    });

    it('should handle empty data', () => {
      render(<DistributionChart data={[]} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      const singleData = [{ name: 'Único', value: 100 }];
      render(<DistributionChart data={singleData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '1');
    });

    it('should handle many data points', () => {
      const manyData = Array.from({ length: 10 }, (_, i) => ({
        name: `Item ${i}`,
        value: (i + 1) * 10,
      }));

      render(<DistributionChart data={manyData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '10');
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });

    it('should use default innerRadius of 60', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-inner-radius', '60');
    });

    it('should use default outerRadius of 100', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-outer-radius', '100');
    });
  });

  describe('Custom Props', () => {
    it('should use custom height', () => {
      render(<DistributionChart data={mockDistributionData} height={400} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });

    it('should use custom innerRadius', () => {
      render(<DistributionChart data={mockDistributionData} innerRadius={80} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-inner-radius', '80');
    });

    it('should use custom outerRadius', () => {
      render(<DistributionChart data={mockDistributionData} outerRadius={120} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-outer-radius', '120');
    });

    it('should use all custom props together', () => {
      render(
        <DistributionChart
          data={mockDistributionData}
          height={500}
          innerRadius={40}
          outerRadius={80}
        />
      );

      const container = screen.getByTestId('responsive-container');
      const pie = screen.getByTestId('pie');

      expect(container).toHaveAttribute('data-height', '500');
      expect(pie).toHaveAttribute('data-inner-radius', '40');
      expect(pie).toHaveAttribute('data-outer-radius', '80');
    });
  });

  describe('Colors', () => {
    it('should use default colors when not provided', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const cells = screen.getAllByTestId('cell');

      // Default colors: emerald, blue, amber, red
      expect(cells[0]).toHaveAttribute('data-fill', '#10b981');
      expect(cells[1]).toHaveAttribute('data-fill', '#3b82f6');
      expect(cells[2]).toHaveAttribute('data-fill', '#f59e0b');
      expect(cells[3]).toHaveAttribute('data-fill', '#ef4444');
    });

    it('should use custom colors when provided', () => {
      render(<DistributionChart data={mockDataWithColors} />);

      const cells = screen.getAllByTestId('cell');

      expect(cells[0]).toHaveAttribute('data-fill', '#ff0000');
      expect(cells[1]).toHaveAttribute('data-fill', '#00ff00');
      expect(cells[2]).toHaveAttribute('data-fill', '#0000ff');
    });

    it('should cycle colors for more than 6 data points', () => {
      const manyData = Array.from({ length: 8 }, (_, i) => ({
        name: `Item ${i}`,
        value: 10,
      }));

      render(<DistributionChart data={manyData} />);

      const cells = screen.getAllByTestId('cell');

      // 7th and 8th should cycle back to 1st and 2nd colors
      expect(cells[6]).toHaveAttribute('data-fill', '#10b981'); // 7th = 1st
      expect(cells[7]).toHaveAttribute('data-fill', '#3b82f6'); // 8th = 2nd
    });
  });

  describe('Default Color Palette', () => {
    it('should have emerald as first color', () => {
      const singleData = [{ name: 'First', value: 100 }];
      render(<DistributionChart data={singleData} />);

      const cell = screen.getByTestId('cell');
      expect(cell).toHaveAttribute('data-fill', '#10b981');
    });

    it('should have blue as second color', () => {
      const twoData = [
        { name: 'First', value: 100 },
        { name: 'Second', value: 100 },
      ];
      render(<DistributionChart data={twoData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[1]).toHaveAttribute('data-fill', '#3b82f6');
    });

    it('should have amber as third color', () => {
      const threeData = [
        { name: 'First', value: 100 },
        { name: 'Second', value: 100 },
        { name: 'Third', value: 100 },
      ];
      render(<DistributionChart data={threeData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[2]).toHaveAttribute('data-fill', '#f59e0b');
    });

    it('should have red as fourth color', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[3]).toHaveAttribute('data-fill', '#ef4444');
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with zero values', () => {
      const zeroData = [
        { name: 'Zero', value: 0 },
        { name: 'Positive', value: 100 },
      ];

      render(<DistributionChart data={zeroData} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should handle all zero values', () => {
      const allZeroData = [
        { name: 'Zero1', value: 0 },
        { name: 'Zero2', value: 0 },
      ];

      render(<DistributionChart data={allZeroData} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      const largeData = [
        { name: 'Large', value: 1000000000 },
        { name: 'Small', value: 1 },
      ];

      render(<DistributionChart data={largeData} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialData = [
        { name: "Caixa D'água", value: 100 },
        { name: 'Item/Outro', value: 50 },
        { name: 'Item & Mais', value: 75 },
      ];

      render(<DistributionChart data={specialData} />);

      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('should handle mixed color and no color data', () => {
      const mixedData = [
        { name: 'With Color', value: 100, color: '#ff0000' },
        { name: 'Without Color', value: 100 },
      ];

      render(<DistributionChart data={mixedData} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells[0]).toHaveAttribute('data-fill', '#ff0000');
      expect(cells[1]).toHaveAttribute('data-fill', '#3b82f6'); // Second default color
    });
  });

  describe('Donut Chart Configuration', () => {
    it('should create donut shape with inner radius', () => {
      render(<DistributionChart data={mockDistributionData} innerRadius={60} />);

      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-inner-radius', '60');
      expect(Number(pie.getAttribute('data-inner-radius'))).toBeGreaterThan(0);
    });

    it('should maintain donut ratio', () => {
      render(<DistributionChart data={mockDistributionData} />);

      const pie = screen.getByTestId('pie');
      const inner = Number(pie.getAttribute('data-inner-radius'));
      const outer = Number(pie.getAttribute('data-outer-radius'));

      expect(outer).toBeGreaterThan(inner);
    });
  });
});
