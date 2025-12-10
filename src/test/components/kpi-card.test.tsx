import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard, KPICardWithSparkline } from '@/components/data-display/kpi-card';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';

describe('KPICard', () => {
  describe('Basic Rendering', () => {
    it('should render title', () => {
      render(
        <KPICard
          title="Total Hectares"
          value="1,234"
          icon={Activity}
        />
      );

      expect(screen.getByText('Total Hectares')).toBeInTheDocument();
    });

    it('should render value as string', () => {
      render(
        <KPICard
          title="Hectares"
          value="1,234.56"
          icon={Activity}
        />
      );

      expect(screen.getByText('1,234.56')).toBeInTheDocument();
    });

    it('should render value as number', () => {
      render(
        <KPICard
          title="Count"
          value={42}
          icon={Users}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <KPICard
          title="KPI"
          value="100"
          description="vs. mês anterior"
          icon={Activity}
        />
      );

      expect(screen.getByText('vs. mês anterior')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
        />
      );

      expect(screen.queryByText('vs.')).not.toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
        />
      );

      // Icon should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton when loading', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          loading
        />
      );

      // Should not show actual content
      expect(screen.queryByText('KPI')).not.toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();

      // Should have skeleton elements
      const skeletons = container.querySelectorAll('[class*="h-4"], [class*="h-8"], [class*="h-3"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render skeleton when not loading', () => {
      render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          loading={false}
        />
      );

      expect(screen.getByText('KPI')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should render trend value with percentage', () => {
      render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 15, direction: 'up' }}
        />
      );

      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should render trend up icon', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'up' }}
        />
      );

      // Should have TrendingUp icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2); // Main icon + trend icon
    });

    it('should render trend down icon', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'down' }}
        />
      );

      // Should have TrendingDown icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render stable trend icon', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 0, direction: 'stable' }}
        />
      );

      // Should have Minus icon for stable
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('should show absolute value for negative trends', () => {
      render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: -15, direction: 'down' }}
        />
      );

      expect(screen.getByText('15%')).toBeInTheDocument(); // Absolute value
    });

    it('should apply green color for positive trend up', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'up', isPositive: true }}
        />
      );

      const trendElement = container.querySelector('.text-green-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply red color for negative trend up', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'up', isPositive: false }}
        />
      );

      const trendElement = container.querySelector('.text-red-600');
      expect(trendElement).toBeInTheDocument();
    });

    it('should apply muted color for stable trend', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 0, direction: 'stable' }}
        />
      );

      const trendElement = container.querySelector('.text-muted-foreground');
      expect(trendElement).toBeInTheDocument();
    });

    it('should default isPositive based on direction', () => {
      // Up should default to positive (green)
      const { container: upContainer } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'up' }}
        />
      );
      expect(upContainer.querySelector('.text-green-600')).toBeInTheDocument();

      // Down should default to negative (red)
      const { container: downContainer } = render(
        <KPICard
          title="KPI Down"
          value="100"
          icon={Activity}
          trend={{ value: 10, direction: 'down' }}
        />
      );
      expect(downContainer.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          variant="default"
        />
      );

      const card = container.firstChild;
      expect(card).not.toHaveClass('border-l-4');
    });

    it('should apply success variant', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          variant="success"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-l-4');
      expect(card).toHaveClass('border-l-emerald-500');
    });

    it('should apply warning variant', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          variant="warning"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-l-4');
      expect(card).toHaveClass('border-l-yellow-500');
    });

    it('should apply danger variant', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          variant="danger"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('border-l-4');
      expect(card).toHaveClass('border-l-red-500');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply custom className in loading state', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
          className="loading-class"
          loading
        />
      );

      expect(container.firstChild).toHaveClass('loading-class');
    });
  });

  describe('Hover Effects', () => {
    it('should have hover shadow transition', () => {
      const { container } = render(
        <KPICard
          title="KPI"
          value="100"
          icon={Activity}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('transition-shadow');
      expect(card).toHaveClass('hover:shadow-md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(
        <KPICard
          title="KPI"
          value={0}
          icon={Activity}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(
        <KPICard
          title="KPI"
          value=""
          icon={Activity}
        />
      );

      // Value should be empty but component should render
      expect(screen.getByText('KPI')).toBeInTheDocument();
    });

    it('should handle long title', () => {
      const longTitle = 'This is a very long title that might overflow';
      render(
        <KPICard
          title={longTitle}
          value="100"
          icon={Activity}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle large value', () => {
      render(
        <KPICard
          title="KPI"
          value="1,234,567,890"
          icon={Activity}
        />
      );

      expect(screen.getByText('1,234,567,890')).toBeInTheDocument();
    });
  });
});

describe('KPICardWithSparkline', () => {
  describe('Basic Rendering', () => {
    it('should render title and value', () => {
      render(
        <KPICardWithSparkline
          title="Sparkline KPI"
          value="500"
          icon={TrendingUp}
        />
      );

      expect(screen.getByText('Sparkline KPI')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should render sparkline when data provided', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
          sparklineData={[10, 20, 15, 30, 25]}
        />
      );

      // Sparkline container should be present
      const sparklineContainer = container.querySelector('.bg-muted\\/50');
      expect(sparklineContainer).toBeInTheDocument();
    });

    it('should render bars for each data point', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
          sparklineData={[10, 20, 15, 30, 25]}
        />
      );

      const bars = container.querySelectorAll('.bg-primary\\/60');
      expect(bars).toHaveLength(5);
    });

    it('should not render sparkline when no data', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
        />
      );

      const sparklineContainer = container.querySelector('.bg-muted\\/50');
      expect(sparklineContainer).not.toBeInTheDocument();
    });

    it('should render description after sparkline', () => {
      render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          description="Últimos 7 dias"
          icon={Activity}
          sparklineData={[10, 20, 15, 30, 25]}
        />
      );

      expect(screen.getByText('Últimos 7 dias')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render skeleton when loading', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
          loading
        />
      );

      expect(screen.queryByText('KPI')).not.toBeInTheDocument();

      // Should have larger skeleton for sparkline area
      const skeletons = container.querySelectorAll('[class*="h-"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Sparkline Height Calculation', () => {
    it('should scale bars relative to max value', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
          sparklineData={[50, 100, 75]} // Max is 100
        />
      );

      const bars = container.querySelectorAll('.bg-primary\\/60');

      // First bar should be 50% height
      expect(bars[0]).toHaveStyle({ height: '50%' });
      // Second bar should be 100% height
      expect(bars[1]).toHaveStyle({ height: '100%' });
      // Third bar should be 75% height
      expect(bars[2]).toHaveStyle({ height: '75%' });
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <KPICardWithSparkline
          title="KPI"
          value="100"
          icon={Activity}
          className="sparkline-custom"
        />
      );

      expect(container.firstChild).toHaveClass('sparkline-custom');
    });
  });
});
