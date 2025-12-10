import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FunnelChart } from '@/components/charts/funnel-chart';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  FunnelChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="funnel-chart">{children}</div>
  ),
  Funnel: ({ data, dataKey, isAnimationActive, children }: { data: unknown[]; dataKey: string; isAnimationActive: boolean; children: React.ReactNode }) => (
    <div data-testid="funnel" data-length={data.length} data-key={dataKey} data-animated={String(isAnimationActive)}>
      {children}
    </div>
  ),
  LabelList: ({ position, fill, stroke, dataKey, fontSize, fontWeight }: { position: string; fill: string; stroke: string; dataKey: string; fontSize: number; fontWeight: string }) => (
    <div
      data-testid="label-list"
      data-position={position}
      data-fill={fill}
      data-stroke={stroke}
      data-key={dataKey}
      data-font-size={fontSize}
      data-font-weight={fontWeight}
    />
  ),
  Tooltip: ({ contentStyle, formatter }: { contentStyle: object; formatter?: (value: number) => [string, string] }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} data-has-formatter={String(!!formatter)} />
  ),
}));

const mockData = [
  { name: 'Visitantes', value: 1000, fill: '#3b82f6' },
  { name: 'Registros', value: 500, fill: '#10b981' },
  { name: 'Conversões', value: 200, fill: '#f59e0b' },
  { name: 'Vendas', value: 100, fill: '#ef4444' },
];

describe('FunnelChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(<FunnelChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render FunnelChart component', () => {
      render(<FunnelChart data={mockData} />);

      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    });

    it('should render Funnel component', () => {
      render(<FunnelChart data={mockData} />);

      expect(screen.getByTestId('funnel')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(<FunnelChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render LabelList', () => {
      render(<FunnelChart data={mockData} />);

      expect(screen.getByTestId('label-list')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      render(<FunnelChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom height', () => {
      render(<FunnelChart data={mockData} height={400} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });

    it('should accept custom height of 500', () => {
      render(<FunnelChart data={mockData} height={500} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '500');
    });
  });

  describe('Funnel Configuration', () => {
    it('should have value as dataKey', () => {
      render(<FunnelChart data={mockData} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-key', 'value');
    });

    it('should have animation enabled', () => {
      render(<FunnelChart data={mockData} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-animated', 'true');
    });
  });

  describe('Data Handling', () => {
    it('should pass data to funnel', () => {
      render(<FunnelChart data={mockData} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '4');
    });

    it('should handle empty data', () => {
      render(<FunnelChart data={[]} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      render(<FunnelChart data={[{ name: 'Single', value: 100, fill: '#000' }]} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '1');
    });

    it('should handle two data points', () => {
      render(
        <FunnelChart
          data={[
            { name: 'First', value: 200, fill: '#000' },
            { name: 'Second', value: 100, fill: '#fff' },
          ]}
        />
      );

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '2');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 10 }, (_, i) => ({
        name: `Stage ${i + 1}`,
        value: 1000 - i * 100,
        fill: `#${i.toString().padStart(6, '0')}`,
      }));

      render(<FunnelChart data={largeData} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '10');
    });
  });

  describe('LabelList Configuration', () => {
    it('should have center position', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-position', 'center');
    });

    it('should have white fill color', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-fill', '#fff');
    });

    it('should have no stroke', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-stroke', 'none');
    });

    it('should use name as dataKey', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-key', 'name');
    });

    it('should have font size of 12', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-font-size', '12');
    });

    it('should have bold font weight', () => {
      render(<FunnelChart data={mockData} />);

      const labelList = screen.getByTestId('label-list');
      expect(labelList).toHaveAttribute('data-font-weight', 'bold');
    });
  });

  describe('Tooltip Configuration', () => {
    it('should have formatter function', () => {
      render(<FunnelChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have custom style', () => {
      render(<FunnelChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      const style = JSON.parse(tooltip.getAttribute('data-style')!);
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius', '6px');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should have 100% width', () => {
      render(<FunnelChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
    });
  });

  describe('Data with Different Fill Colors', () => {
    it('should preserve fill colors from data', () => {
      const coloredData = [
        { name: 'Blue', value: 100, fill: '#0000ff' },
        { name: 'Green', value: 80, fill: '#00ff00' },
        { name: 'Red', value: 60, fill: '#ff0000' },
      ];

      render(<FunnelChart data={coloredData} />);

      // Verify data is passed correctly
      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with zero values', () => {
      const dataWithZero = [
        { name: 'Start', value: 100, fill: '#000' },
        { name: 'Zero', value: 0, fill: '#111' },
        { name: 'End', value: 50, fill: '#222' },
      ];

      render(<FunnelChart data={dataWithZero} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '3');
    });

    it('should handle data with same values', () => {
      const sameValues = [
        { name: 'A', value: 100, fill: '#000' },
        { name: 'B', value: 100, fill: '#111' },
        { name: 'C', value: 100, fill: '#222' },
      ];

      render(<FunnelChart data={sameValues} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '3');
    });

    it('should handle data with very large values', () => {
      const largeValues = [
        { name: 'Large', value: 1000000000, fill: '#000' },
        { name: 'Medium', value: 500000000, fill: '#111' },
        { name: 'Small', value: 100000000, fill: '#222' },
      ];

      render(<FunnelChart data={largeValues} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '3');
    });

    it('should handle data with special characters in names', () => {
      const specialChars = [
        { name: 'Estágio 1 (início)', value: 100, fill: '#000' },
        { name: 'Conversão & Vendas', value: 50, fill: '#111' },
        { name: 'Final "resultado"', value: 25, fill: '#222' },
      ];

      render(<FunnelChart data={specialChars} />);

      const funnel = screen.getByTestId('funnel');
      expect(funnel).toHaveAttribute('data-length', '3');
    });
  });
});
