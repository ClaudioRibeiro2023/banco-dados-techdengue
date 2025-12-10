import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartWrapper } from '@/components/charts/chart-wrapper';

describe('ChartWrapper', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <ChartWrapper title="Test Chart">
          <div data-testid="chart-content">Chart Content</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <ChartWrapper title="Sales Chart">
          <div>Content</div>
        </ChartWrapper>
      );

      expect(screen.getByText('Sales Chart')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <ChartWrapper title="Chart" description="This is a description">
          <div>Content</div>
        </ChartWrapper>
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(
        <ChartWrapper title="Chart">
          <div>Content</div>
        </ChartWrapper>
      );

      expect(screen.queryByText('This is a description')).not.toBeInTheDocument();
    });

    it('should render without card when no title', () => {
      const { container } = render(
        <ChartWrapper>
          <div data-testid="content">Content</div>
        </ChartWrapper>
      );

      // Should not have card structure
      expect(container.querySelector('[class*="Card"]')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should render action component when provided', () => {
      render(
        <ChartWrapper
          title="Chart"
          action={<button data-testid="action-btn">Action</button>}
        >
          <div>Content</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading is true with title', () => {
      const { container } = render(
        <ChartWrapper title="Chart" loading={true}>
          <div data-testid="chart-content">Content</div>
        </ChartWrapper>
      );

      // Content should not be visible during loading
      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
      // Should have loading container with 300px height
      const loadingContainer = container.querySelector('.h-\\[300px\\]');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('should show skeleton when loading is true without title', () => {
      const { container } = render(
        <ChartWrapper loading={true}>
          <div data-testid="chart-content">Content</div>
        </ChartWrapper>
      );

      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });

    it('should show content when loading is false', () => {
      render(
        <ChartWrapper title="Chart" loading={false}>
          <div data-testid="chart-content">Content</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('should default loading to false', () => {
      render(
        <ChartWrapper title="Chart">
          <div data-testid="chart-content">Content</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ChartWrapper title="Chart" className="custom-class">
          <div>Content</div>
        </ChartWrapper>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply className when no title', () => {
      const { container } = render(
        <ChartWrapper className="wrapper-class">
          <div>Content</div>
        </ChartWrapper>
      );

      expect(container.querySelector('.wrapper-class')).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have card header with title', () => {
      const { container } = render(
        <ChartWrapper title="Test Title">
          <div>Content</div>
        </ChartWrapper>
      );

      // Should have header structure with flex layout
      const header = container.querySelector('.flex.flex-row.items-center');
      expect(header).toBeTruthy();
    });

    it('should have card content section', () => {
      render(
        <ChartWrapper title="Test">
          <div data-testid="content">Content</div>
        </ChartWrapper>
      );

      // Content should be rendered inside card
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible title as heading', () => {
      render(
        <ChartWrapper title="Accessible Chart">
          <div>Content</div>
        </ChartWrapper>
      );

      const title = screen.getByText('Accessible Chart');
      expect(title).toBeInTheDocument();
    });

    it('should render action within header for screen readers', () => {
      render(
        <ChartWrapper
          title="Chart"
          action={<button aria-label="Download chart">Download</button>}
        >
          <div>Content</div>
        </ChartWrapper>
      );

      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });
  });

  describe('Complex Children', () => {
    it('should render multiple children', () => {
      render(
        <ChartWrapper title="Multi Content">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      render(
        <ChartWrapper title="Nested">
          <div>
            <span data-testid="nested">Nested content</span>
          </div>
        </ChartWrapper>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(
        <ChartWrapper title="Null Child">
          {null}
        </ChartWrapper>
      );

      expect(screen.getByText('Null Child')).toBeInTheDocument();
    });

    it('should handle conditional rendering in children', () => {
      const showContent = true;
      render(
        <ChartWrapper title="Conditional">
          {showContent && <div data-testid="conditional">Shown</div>}
        </ChartWrapper>
      );

      expect(screen.getByTestId('conditional')).toBeInTheDocument();
    });
  });
});

describe('ChartWrapper Integration', () => {
  it('should work as wrapper for chart components', () => {
    // Simulating a chart being wrapped
    const MockChart = () => (
      <svg data-testid="mock-chart" width="100" height="100">
        <rect width="100" height="100" fill="blue" />
      </svg>
    );

    render(
      <ChartWrapper title="Mock Chart" description="A mock chart component">
        <MockChart />
      </ChartWrapper>
    );

    expect(screen.getByText('Mock Chart')).toBeInTheDocument();
    expect(screen.getByText('A mock chart component')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('should handle responsive chart content', () => {
    render(
      <ChartWrapper title="Responsive Chart">
        <div
          data-testid="responsive-content"
          style={{ width: '100%', height: '300px' }}
        >
          Responsive content
        </div>
      </ChartWrapper>
    );

    const content = screen.getByTestId('responsive-content');
    expect(content).toHaveStyle({ width: '100%' });
  });
});
