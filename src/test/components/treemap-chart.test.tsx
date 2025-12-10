import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TreemapChart } from '@/components/charts/treemap-chart';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  Treemap: ({ children, data, dataKey, nameKey, aspectRatio, stroke, content }: { children: React.ReactNode; data: unknown[]; dataKey: string; nameKey: string; aspectRatio: number; stroke: string; content: React.ReactNode }) => (
    <div
      data-testid="treemap"
      data-length={data.length}
      data-key={dataKey}
      data-name-key={nameKey}
      data-aspect-ratio={aspectRatio}
      data-stroke={stroke}
      data-has-content={String(!!content)}
    >
      {children}
    </div>
  ),
  Tooltip: ({ contentStyle, formatter }: { contentStyle: object; formatter?: (value: number) => [string, string] }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} data-has-formatter={String(!!formatter)} />
  ),
}));

const mockData = [
  { name: 'Pneus', value: 450 },
  { name: 'Vasos', value: 320 },
  { name: 'Caixas d\'água', value: 280 },
  { name: 'Garrafas', value: 210 },
  { name: 'Outros', value: 180 },
];

describe('TreemapChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(<TreemapChart data={mockData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render Treemap component', () => {
      render(<TreemapChart data={mockData} />);

      expect(screen.getByTestId('treemap')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(<TreemapChart data={mockData} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default height of 300', () => {
      render(<TreemapChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '300');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom height', () => {
      render(<TreemapChart data={mockData} height={400} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });

    it('should accept custom height of 500', () => {
      render(<TreemapChart data={mockData} height={500} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '500');
    });
  });

  describe('Treemap Configuration', () => {
    it('should have value as dataKey', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-key', 'value');
    });

    it('should have name as nameKey', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-name-key', 'name');
    });

    it('should have aspectRatio of 4/3', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      const aspectRatio = parseFloat(treemap.getAttribute('data-aspect-ratio')!);
      expect(aspectRatio).toBeCloseTo(4 / 3, 2);
    });

    it('should have white stroke', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-stroke', '#fff');
    });

    it('should have custom content component', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-has-content', 'true');
    });
  });

  describe('Data Handling', () => {
    it('should pass data to treemap', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '5');
    });

    it('should handle empty data', () => {
      render(<TreemapChart data={[]} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      render(<TreemapChart data={[{ name: 'Single', value: 100 }]} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '1');
    });

    it('should handle two data points', () => {
      render(
        <TreemapChart
          data={[
            { name: 'A', value: 100 },
            { name: 'B', value: 200 },
          ]}
        />
      );

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '2');
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        name: `Item ${i + 1}`,
        value: Math.random() * 1000,
      }));

      render(<TreemapChart data={largeData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '20');
    });
  });

  describe('Tooltip Configuration', () => {
    it('should have formatter function', () => {
      render(<TreemapChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have custom style', () => {
      render(<TreemapChart data={mockData} />);

      const tooltip = screen.getByTestId('tooltip');
      const style = JSON.parse(tooltip.getAttribute('data-style')!);
      expect(style).toHaveProperty('backgroundColor');
      expect(style).toHaveProperty('border');
      expect(style).toHaveProperty('borderRadius', '6px');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should have 100% width', () => {
      render(<TreemapChart data={mockData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
    });
  });

  describe('Data with Custom Fill', () => {
    it('should handle data with fill property', () => {
      const dataWithFill = [
        { name: 'Red', value: 100, fill: '#ff0000' },
        { name: 'Green', value: 200, fill: '#00ff00' },
        { name: 'Blue', value: 150, fill: '#0000ff' },
      ];

      render(<TreemapChart data={dataWithFill} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with zero values', () => {
      const dataWithZero = [
        { name: 'Zero', value: 0 },
        { name: 'Normal', value: 100 },
      ];

      render(<TreemapChart data={dataWithZero} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '2');
    });

    it('should handle data with very large values', () => {
      const largeValues = [
        { name: 'Large', value: 1000000000 },
        { name: 'Small', value: 1 },
      ];

      render(<TreemapChart data={largeValues} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '2');
    });

    it('should handle data with same values', () => {
      const sameValues = [
        { name: 'A', value: 100 },
        { name: 'B', value: 100 },
        { name: 'C', value: 100 },
      ];

      render(<TreemapChart data={sameValues} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '3');
    });

    it('should handle data with special characters in names', () => {
      const specialChars = [
        { name: 'Caixas d\'água', value: 100 },
        { name: 'Item & Others', value: 200 },
        { name: '"Quoted"', value: 150 },
      ];

      render(<TreemapChart data={specialChars} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '3');
    });

    it('should handle data with unicode characters', () => {
      const unicodeData = [
        { name: 'São Paulo', value: 100 },
        { name: 'München', value: 200 },
        { name: '東京', value: 150 },
      ];

      render(<TreemapChart data={unicodeData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-length', '3');
    });
  });

  describe('Default Colors', () => {
    it('should have default COLORS array used by CustomContent', () => {
      // The COLORS constant is used internally by CustomContent
      // We can verify the component renders correctly without explicit colors
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toBeInTheDocument();
    });
  });

  describe('CustomContent Component', () => {
    // CustomContent is an internal component that handles rendering of treemap cells
    // It's passed as content prop to Treemap

    it('should have content prop set', () => {
      render(<TreemapChart data={mockData} />);

      const treemap = screen.getByTestId('treemap');
      expect(treemap).toHaveAttribute('data-has-content', 'true');
    });
  });

  describe('Multiple Heights', () => {
    it('should work with height 200', () => {
      render(<TreemapChart data={mockData} height={200} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '200');
    });

    it('should work with height 600', () => {
      render(<TreemapChart data={mockData} height={600} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '600');
    });
  });
});
