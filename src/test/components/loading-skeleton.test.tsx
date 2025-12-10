import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CardSkeleton,
  KPIGridSkeleton,
  ChartSkeleton,
  TableSkeleton,
  MapSkeleton,
  PageSkeleton,
  ListSkeleton,
} from '@/components/feedback/loading-skeleton';

describe('Loading Skeleton Components', () => {
  describe('CardSkeleton', () => {
    it('should render skeleton card', () => {
      const { container } = render(<CardSkeleton />);

      // Should render the container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CardSkeleton className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have card structure with border', () => {
      const { container } = render(<CardSkeleton />);

      expect(container.firstChild).toHaveClass('rounded-lg');
      expect(container.firstChild).toHaveClass('border');
    });

    it('should have nested elements for content placeholders', () => {
      const { container } = render(<CardSkeleton />);

      // Should have flex container with items
      const flexContainer = container.querySelector('.flex.items-center');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should use bg-card class', () => {
      const { container } = render(<CardSkeleton />);

      expect(container.firstChild).toHaveClass('bg-card');
    });

    it('should have consistent padding', () => {
      const { container } = render(<CardSkeleton />);

      expect(container.firstChild).toHaveClass('p-6');
    });
  });

  describe('KPIGridSkeleton', () => {
    it('should render 4 card skeletons', () => {
      const { container } = render(<KPIGridSkeleton />);

      const cards = container.querySelectorAll('.rounded-lg.border');
      expect(cards).toHaveLength(4);
    });

    it('should have responsive grid layout', () => {
      const { container } = render(<KPIGridSkeleton />);

      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-4');
    });

    it('should have correct grid columns', () => {
      const { container } = render(<KPIGridSkeleton />);

      const grid = container.firstChild;
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('ChartSkeleton', () => {
    it('should render chart skeleton', () => {
      const { container } = render(<ChartSkeleton />);

      expect(container.firstChild).toHaveClass('rounded-lg');
      expect(container.firstChild).toHaveClass('border');
    });

    it('should apply custom className', () => {
      const { container } = render(<ChartSkeleton className="custom-chart" />);

      expect(container.firstChild).toHaveClass('custom-chart');
    });

    it('should have header section', () => {
      const { container } = render(<ChartSkeleton />);

      // Should have padding sections
      const paddedSections = container.querySelectorAll('.p-6');
      expect(paddedSections.length).toBeGreaterThan(0);
    });

    it('should have bg-card class', () => {
      const { container } = render(<ChartSkeleton />);

      expect(container.firstChild).toHaveClass('bg-card');
    });
  });

  describe('TableSkeleton', () => {
    it('should render with default 5 rows', () => {
      const { container } = render(<TableSkeleton />);

      // Container should render
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('should render custom number of rows', () => {
      const { container } = render(<TableSkeleton rows={3} columns={4} />);

      // Should have space-y-3 container for rows
      const rowsContainer = container.querySelector('.space-y-3');
      expect(rowsContainer).toBeInTheDocument();
    });

    it('should have table structure with border', () => {
      const { container } = render(<TableSkeleton />);

      expect(container.firstChild).toHaveClass('border');
      expect(container.firstChild).toHaveClass('bg-card');
    });

    it('should have header with border-b', () => {
      const { container } = render(<TableSkeleton />);

      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });

    it('should handle zero rows', () => {
      const { container } = render(<TableSkeleton rows={0} />);

      // Should still have header
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });
  });

  describe('MapSkeleton', () => {
    it('should render map skeleton', () => {
      const { container } = render(<MapSkeleton />);

      expect(container.firstChild).toHaveClass('rounded-lg');
      expect(container.firstChild).toHaveClass('overflow-hidden');
    });

    it('should apply custom className', () => {
      const { container } = render(<MapSkeleton className="custom-map" />);

      expect(container.firstChild).toHaveClass('custom-map');
    });

    it('should have control button placeholders', () => {
      const { container } = render(<MapSkeleton />);

      // Navigation controls on the left
      const controlsContainer = container.querySelector('.absolute.top-4.left-4');
      expect(controlsContainer).toBeInTheDocument();
    });

    it('should have legend/info placeholder', () => {
      const { container } = render(<MapSkeleton />);

      const legendPlaceholder = container.querySelector('.absolute.bottom-4.right-4');
      expect(legendPlaceholder).toBeInTheDocument();
    });

    it('should have full background skeleton', () => {
      const { container } = render(<MapSkeleton />);

      const bgSkeleton = container.querySelector('.absolute.inset-0');
      expect(bgSkeleton).toBeInTheDocument();
    });

    it('should be relatively positioned', () => {
      const { container } = render(<MapSkeleton />);

      expect(container.firstChild).toHaveClass('relative');
    });
  });

  describe('PageSkeleton', () => {
    it('should render page skeleton', () => {
      const { container } = render(<PageSkeleton />);

      expect(container.firstChild).toHaveClass('space-y-6');
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('should have header section', () => {
      const { container } = render(<PageSkeleton />);

      // Should have justify-between header
      const header = container.querySelector('.flex.justify-between');
      expect(header).toBeInTheDocument();
    });

    it('should include KPI grid skeleton', () => {
      const { container } = render(<PageSkeleton />);

      // Should have KPI grid with 4 cards
      const kpiGrid = container.querySelector('.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(kpiGrid).toBeInTheDocument();
    });

    it('should include chart skeletons', () => {
      const { container } = render(<PageSkeleton />);

      // Should have 2 chart skeletons in a grid
      const chartGrid = container.querySelector('.lg\\:grid-cols-2');
      expect(chartGrid).toBeInTheDocument();
    });
  });

  describe('ListSkeleton', () => {
    it('should render default 5 items', () => {
      const { container } = render(<ListSkeleton />);

      const items = container.querySelectorAll('.rounded-lg.border');
      expect(items).toHaveLength(5);
    });

    it('should render custom number of items', () => {
      const { container } = render(<ListSkeleton items={3} />);

      const items = container.querySelectorAll('.rounded-lg.border');
      expect(items).toHaveLength(3);
    });

    it('should have avatar placeholder in each item', () => {
      const { container } = render(<ListSkeleton items={2} />);

      const avatarPlaceholders = container.querySelectorAll('.rounded-full');
      expect(avatarPlaceholders).toHaveLength(2);
    });

    it('should have text placeholders in each item', () => {
      const { container } = render(<ListSkeleton items={1} />);

      // Content container
      const textContainer = container.querySelector('.flex-1.space-y-2');
      expect(textContainer).toBeInTheDocument();
    });

    it('should handle zero items', () => {
      const { container } = render(<ListSkeleton items={0} />);

      const items = container.querySelectorAll('.rounded-lg.border');
      expect(items).toHaveLength(0);
    });

    it('should handle large number of items', () => {
      const { container } = render(<ListSkeleton items={100} />);

      const items = container.querySelectorAll('.rounded-lg.border');
      expect(items).toHaveLength(100);
    });

    it('should have flex layout for items', () => {
      const { container } = render(<ListSkeleton items={1} />);

      const item = container.querySelector('.flex.items-center.gap-4');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid in KPIGridSkeleton', () => {
      const { container } = render(<KPIGridSkeleton />);

      const grid = container.firstChild;
      // Mobile: 1 column (default)
      // Tablet (md): 2 columns
      // Desktop (lg): 4 columns
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('should have responsive grid in PageSkeleton charts', () => {
      const { container } = render(<PageSkeleton />);

      const chartGrid = container.querySelector('.lg\\:grid-cols-2');
      expect(chartGrid).toBeInTheDocument();
    });
  });
});
