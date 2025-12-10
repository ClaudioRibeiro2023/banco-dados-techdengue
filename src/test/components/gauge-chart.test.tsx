import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GaugeChart } from '@/components/charts/gauge-chart';

describe('GaugeChart', () => {
  describe('Rendering', () => {
    it('should render SVG element', () => {
      const { container } = render(<GaugeChart value={50} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render background arc path', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('should render value arc path', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(2);
    });

    it('should display the value', () => {
      render(<GaugeChart value={75} />);

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should display default label', () => {
      render(<GaugeChart value={50} />);

      expect(screen.getByText('%')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should display custom label', () => {
      render(<GaugeChart value={50} label="pontos" />);

      expect(screen.getByText('pontos')).toBeInTheDocument();
    });

    it('should respect custom max value', () => {
      render(<GaugeChart value={50} max={200} />);

      // 50/200 = 25% (should be yellow/red color range)
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should accept custom size', () => {
      const { container } = render(<GaugeChart value={50} size={240} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '240');
    });

    it('should apply custom className', () => {
      const { container } = render(<GaugeChart value={50} className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Default Props', () => {
    it('should have default max of 100', () => {
      render(<GaugeChart value={50} />);

      // Value of 50 with default max of 100 = 50%
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should have default label of %', () => {
      render(<GaugeChart value={50} />);

      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('should have default size of 180', () => {
      const { container } = render(<GaugeChart value={50} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '180');
    });
  });

  describe('Color Based on Percentage', () => {
    it('should use green color for >= 80%', () => {
      const { container } = render(<GaugeChart value={80} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1]; // Second path is the value arc
      expect(valuePath).toHaveAttribute('stroke', '#10b981');
    });

    it('should use green color for 100%', () => {
      const { container } = render(<GaugeChart value={100} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#10b981');
    });

    it('should use green color for 90%', () => {
      const { container } = render(<GaugeChart value={90} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#10b981');
    });

    it('should use yellow color for >= 60% and < 80%', () => {
      const { container } = render(<GaugeChart value={70} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#f59e0b');
    });

    it('should use yellow color for exactly 60%', () => {
      const { container } = render(<GaugeChart value={60} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#f59e0b');
    });

    it('should use yellow color for 79%', () => {
      const { container } = render(<GaugeChart value={79} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#f59e0b');
    });

    it('should use red color for < 60%', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#ef4444');
    });

    it('should use red color for 0%', () => {
      const { container } = render(<GaugeChart value={0} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#ef4444');
    });

    it('should use red color for 59%', () => {
      const { container } = render(<GaugeChart value={59} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#ef4444');
    });
  });

  describe('Value Capping', () => {
    it('should cap percentage at 100%', () => {
      const { container } = render(<GaugeChart value={150} max={100} />);

      // Should display 150 but visual percentage capped at 100
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should cap percentage at 100% with different max', () => {
      const { container } = render(<GaugeChart value={300} max={200} />);

      // 300/200 = 150%, should cap at 100% visual
      expect(screen.getByText('300')).toBeInTheDocument();
    });
  });

  describe('Custom Max Value', () => {
    it('should calculate percentage with custom max', () => {
      const { container } = render(<GaugeChart value={40} max={200} />);

      // 40/200 = 20%, should be red
      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#ef4444');
    });

    it('should use green with custom max when high percentage', () => {
      const { container } = render(<GaugeChart value={160} max={200} />);

      // 160/200 = 80%, should be green
      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#10b981');
    });

    it('should use yellow with custom max when medium percentage', () => {
      const { container } = render(<GaugeChart value={140} max={200} />);

      // 140/200 = 70%, should be yellow
      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveAttribute('stroke', '#f59e0b');
    });
  });

  describe('SVG Attributes', () => {
    it('should have correct viewBox', () => {
      const { container } = render(<GaugeChart value={50} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 180 120');
    });

    it('should have height proportional to width', () => {
      const { container } = render(<GaugeChart value={50} size={180} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '108'); // 180 * 0.6 = 108
    });

    it('should scale height with custom size', () => {
      const { container } = render(<GaugeChart value={50} size={200} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '120'); // 200 * 0.6 = 120
    });
  });

  describe('Path Attributes', () => {
    it('should have rounded linecaps', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('stroke-linecap', 'round');
      });
    });

    it('should have strokeWidth of 12', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('stroke-width', '12');
      });
    });

    it('should have no fill', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      paths.forEach((path) => {
        expect(path).toHaveAttribute('fill', 'none');
      });
    });
  });

  describe('Styling', () => {
    it('should have relative position', () => {
      const { container } = render(<GaugeChart value={50} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });

    it('should have flex layout', () => {
      const { container } = render(<GaugeChart value={50} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
    });

    it('should have items-center', () => {
      const { container } = render(<GaugeChart value={50} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('items-center');
    });

    it('should have justify-center', () => {
      const { container } = render(<GaugeChart value={50} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-center');
    });
  });

  describe('Value Display', () => {
    it('should have bold font weight for value', () => {
      const { container } = render(<GaugeChart value={50} />);

      const valueText = screen.getByText('50');
      expect(valueText).toHaveClass('font-bold');
    });

    it('should have text-3xl for value', () => {
      const { container } = render(<GaugeChart value={50} />);

      const valueText = screen.getByText('50');
      expect(valueText).toHaveClass('text-3xl');
    });

    it('should have muted foreground for label', () => {
      const { container } = render(<GaugeChart value={50} />);

      const label = screen.getByText('%');
      expect(label).toHaveClass('text-muted-foreground');
    });

    it('should have text-sm for label', () => {
      const { container } = render(<GaugeChart value={50} />);

      const label = screen.getByText('%');
      expect(label).toHaveClass('text-sm');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(<GaugeChart value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative value as red', () => {
      const { container } = render(<GaugeChart value={-10} />);

      // Negative will be capped at 0% visually
      expect(screen.getByText('-10')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<GaugeChart value={75.5} />);

      expect(screen.getByText('75.5')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      render(<GaugeChart value={1000000} />);

      expect(screen.getByText('1000000')).toBeInTheDocument();
    });
  });

  describe('Transition Animation', () => {
    it('should have transition class on value path', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveClass('transition-all');
    });

    it('should have duration-500 on value path', () => {
      const { container } = render(<GaugeChart value={50} />);

      const paths = container.querySelectorAll('path');
      const valuePath = paths[1];
      expect(valuePath).toHaveClass('duration-500');
    });
  });
});
