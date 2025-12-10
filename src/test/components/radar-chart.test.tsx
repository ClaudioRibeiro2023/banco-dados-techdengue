import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadarChart } from '@/components/charts/radar-chart';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: number }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  RadarChart: ({ children, data, cx, cy, outerRadius }: { children: React.ReactNode; data: unknown[]; cx: string; cy: string; outerRadius: string }) => (
    <div data-testid="radar-chart" data-length={data.length} data-cx={cx} data-cy={cy} data-outer-radius={outerRadius}>
      {children}
    </div>
  ),
  Radar: ({ name, dataKey, stroke, fill, fillOpacity }: { name: string; dataKey: string; stroke: string; fill: string; fillOpacity: number }) => (
    <div data-testid="radar" data-name={name} data-key={dataKey} data-stroke={stroke} data-fill={fill} data-opacity={fillOpacity} />
  ),
  PolarGrid: ({ className }: { className?: string }) => (
    <div data-testid="polar-grid" data-class={className} />
  ),
  PolarAngleAxis: ({ dataKey, tick, className }: { dataKey: string; tick: object; className?: string }) => (
    <div data-testid="polar-angle-axis" data-key={dataKey} data-tick={JSON.stringify(tick)} data-class={className} />
  ),
  PolarRadiusAxis: ({ angle, domain, tick, className }: { angle: number; domain: (string | number)[]; tick: object; className?: string }) => (
    <div data-testid="polar-radius-axis" data-angle={angle} data-domain={JSON.stringify(domain)} data-tick={JSON.stringify(tick)} data-class={className} />
  ),
  Tooltip: ({ contentStyle, formatter }: { contentStyle: object; formatter?: (value: number) => string }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} data-has-formatter={String(!!formatter)} />
  ),
  Legend: ({ formatter }: { formatter?: (value: string) => React.ReactNode }) => (
    <div data-testid="legend" data-has-formatter={String(!!formatter)} />
  ),
}));

const mockDataKeys = [
  { key: 'metric1', name: 'Metric 1', color: '#10b981' },
  { key: 'metric2', name: 'Metric 2', color: '#3b82f6' },
];

const mockData = [
  { subject: 'A', metric1: 80, metric2: 70 },
  { subject: 'B', metric1: 90, metric2: 85 },
  { subject: 'C', metric1: 75, metric2: 90 },
  { subject: 'D', metric1: 85, metric2: 80 },
  { subject: 'E', metric1: 70, metric2: 75 },
];

describe('RadarChart', () => {
  describe('Rendering', () => {
    it('should render ResponsiveContainer', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render RadarChart component', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('should render PolarGrid', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
    });

    it('should render PolarAngleAxis', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('polar-angle-axis')).toBeInTheDocument();
    });

    it('should render PolarRadiusAxis', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('polar-radius-axis')).toBeInTheDocument();
    });

    it('should render Tooltip', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render Legend', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Radar Components', () => {
    it('should render one Radar per dataKey', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars).toHaveLength(2);
    });

    it('should have correct dataKeys', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars[0]).toHaveAttribute('data-key', 'metric1');
      expect(radars[1]).toHaveAttribute('data-key', 'metric2');
    });

    it('should have correct names', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars[0]).toHaveAttribute('data-name', 'Metric 1');
      expect(radars[1]).toHaveAttribute('data-name', 'Metric 2');
    });

    it('should have correct colors', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars[0]).toHaveAttribute('data-stroke', '#10b981');
      expect(radars[0]).toHaveAttribute('data-fill', '#10b981');
      expect(radars[1]).toHaveAttribute('data-stroke', '#3b82f6');
      expect(radars[1]).toHaveAttribute('data-fill', '#3b82f6');
    });

    it('should have fillOpacity of 0.2', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      radars.forEach((radar) => {
        expect(radar).toHaveAttribute('data-opacity', '0.2');
      });
    });
  });

  describe('Default Props', () => {
    it('should use default height of 350', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '350');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom height', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
          height={400}
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-height', '400');
    });
  });

  describe('Chart Center Configuration', () => {
    it('should have cx of 50%', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-cx', '50%');
    });

    it('should have cy of 50%', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-cy', '50%');
    });

    it('should have outerRadius of 80%', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-outer-radius', '80%');
    });
  });

  describe('Angle Axis Configuration', () => {
    it('should use angleAxisKey for dataKey', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const angleAxis = screen.getByTestId('polar-angle-axis');
      expect(angleAxis).toHaveAttribute('data-key', 'subject');
    });

    it('should accept different angleAxisKey', () => {
      const dataWithCategory = [
        { category: 'Cat A', metric1: 80 },
        { category: 'Cat B', metric1: 90 },
      ];

      render(
        <RadarChart
          data={dataWithCategory}
          dataKeys={[{ key: 'metric1', name: 'M1', color: '#000' }]}
          angleAxisKey="category"
        />
      );

      const angleAxis = screen.getByTestId('polar-angle-axis');
      expect(angleAxis).toHaveAttribute('data-key', 'category');
    });

    it('should have font size 12 for tick', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const angleAxis = screen.getByTestId('polar-angle-axis');
      const tick = JSON.parse(angleAxis.getAttribute('data-tick')!);
      expect(tick.fontSize).toBe(12);
    });
  });

  describe('Radius Axis Configuration', () => {
    it('should have angle of 30', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radiusAxis = screen.getByTestId('polar-radius-axis');
      expect(radiusAxis).toHaveAttribute('data-angle', '30');
    });

    it('should have domain starting from 0', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radiusAxis = screen.getByTestId('polar-radius-axis');
      const domain = JSON.parse(radiusAxis.getAttribute('data-domain')!);
      expect(domain[0]).toBe(0);
      expect(domain[1]).toBe('auto');
    });

    it('should have font size 10 for tick', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const radiusAxis = screen.getByTestId('polar-radius-axis');
      const tick = JSON.parse(radiusAxis.getAttribute('data-tick')!);
      expect(tick.fontSize).toBe(10);
    });
  });

  describe('Data Handling', () => {
    it('should pass data to chart', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-length', '5');
    });

    it('should handle empty data', () => {
      render(
        <RadarChart
          data={[]}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-length', '0');
    });

    it('should handle single data point', () => {
      render(
        <RadarChart
          data={[{ subject: 'A', metric1: 80, metric2: 70 }]}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-length', '1');
    });

    it('should handle many data points', () => {
      const manyPoints = Array.from({ length: 10 }, (_, i) => ({
        subject: `Point ${i}`,
        metric1: Math.random() * 100,
        metric2: Math.random() * 100,
      }));

      render(
        <RadarChart
          data={manyPoints}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const chart = screen.getByTestId('radar-chart');
      expect(chart).toHaveAttribute('data-length', '10');
    });
  });

  describe('DataKeys Configuration', () => {
    it('should handle single dataKey', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={[{ key: 'metric1', name: 'Single Metric', color: '#10b981' }]}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars).toHaveLength(1);
    });

    it('should handle many dataKeys', () => {
      const manyDataKeys = Array.from({ length: 5 }, (_, i) => ({
        key: `metric${i}`,
        name: `Metric ${i}`,
        color: `#${i.toString().padStart(6, '0')}`,
      }));

      render(
        <RadarChart
          data={mockData}
          dataKeys={manyDataKeys}
          angleAxisKey="subject"
        />
      );

      const radars = screen.getAllByTestId('radar');
      expect(radars).toHaveLength(5);
    });
  });

  describe('Tooltip Configuration', () => {
    it('should have formatter function', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-has-formatter', 'true');
    });

    it('should have custom style', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
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
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const legend = screen.getByTestId('legend');
      expect(legend).toHaveAttribute('data-has-formatter', 'true');
    });
  });

  describe('Grid Styling', () => {
    it('should have stroke-muted class', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const grid = screen.getByTestId('polar-grid');
      expect(grid).toHaveAttribute('data-class', 'stroke-muted');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should have 100% width', () => {
      render(
        <RadarChart
          data={mockData}
          dataKeys={mockDataKeys}
          angleAxisKey="subject"
        />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
    });
  });
});
