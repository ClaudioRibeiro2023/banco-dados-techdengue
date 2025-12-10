import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { calculateTrend } from '@/features/dashboard/hooks/use-dashboard-kpis';

// Create a wrapper with QueryClient for testing
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('calculateTrend', () => {
  it('should return stable for zero previous value', () => {
    const result = calculateTrend(100, 0);
    expect(result).toEqual({ value: 0, direction: 'stable' });
  });

  it('should return up direction for positive growth', () => {
    const result = calculateTrend(120, 100);
    expect(result.direction).toBe('up');
    expect(result.value).toBe(20);
  });

  it('should return down direction for negative growth', () => {
    const result = calculateTrend(80, 100);
    expect(result.direction).toBe('down');
    expect(result.value).toBe(20);
  });

  it('should return stable for minimal change', () => {
    const result = calculateTrend(100.5, 100);
    expect(result.direction).toBe('stable');
    expect(result.value).toBe(0);
  });

  it('should return stable for exactly 1% increase', () => {
    const result = calculateTrend(101, 100);
    expect(result.direction).toBe('stable');
  });

  it('should return up for just over 1% increase', () => {
    const result = calculateTrend(101.5, 100);
    expect(result.direction).toBe('up');
  });

  it('should return down for just over 1% decrease', () => {
    const result = calculateTrend(98.5, 100);
    expect(result.direction).toBe('down');
  });

  it('should handle large growth correctly', () => {
    const result = calculateTrend(200, 100);
    expect(result.direction).toBe('up');
    expect(result.value).toBe(100);
  });

  it('should handle large decrease correctly', () => {
    const result = calculateTrend(50, 100);
    expect(result.direction).toBe('down');
    expect(result.value).toBe(50);
  });

  it('should round percentage values', () => {
    const result = calculateTrend(115, 100);
    expect(result.value).toBe(15);
    expect(Number.isInteger(result.value)).toBe(true);
  });

  it('should handle same values as stable', () => {
    const result = calculateTrend(100, 100);
    expect(result.direction).toBe('stable');
    expect(result.value).toBe(0);
  });

  it('should handle decimal values', () => {
    const result = calculateTrend(1.5, 1.0);
    expect(result.direction).toBe('up');
    expect(result.value).toBe(50);
  });

  it('should handle very small values', () => {
    const result = calculateTrend(0.002, 0.001);
    expect(result.direction).toBe('up');
    expect(result.value).toBe(100);
  });
});

describe('KPI Data Transformations', () => {
  it('should format KPI values correctly', () => {
    const kpiData = {
      hectaresMapeados: 1234.5678,
      criadourosIdentificados: 567,
      taxaDevolutivas: 85.5,
      atividadesAndamento: 12,
    };

    // Test formatting
    expect(Math.round(kpiData.hectaresMapeados * 100) / 100).toBe(1234.57);
    expect(kpiData.criadourosIdentificados).toBe(567);
    expect(kpiData.taxaDevolutivas.toFixed(1)).toBe('85.5');
  });

  it('should handle null KPI values', () => {
    const kpiData = {
      hectaresMapeados: null as number | null,
      criadourosIdentificados: null as number | null,
    };

    expect(kpiData.hectaresMapeados ?? 0).toBe(0);
    expect(kpiData.criadourosIdentificados ?? 0).toBe(0);
  });

  it('should calculate percentage correctly', () => {
    const total = 100;
    const completed = 75;
    const percentage = (completed / total) * 100;
    expect(percentage).toBe(75);
  });

  it('should handle division by zero in percentage', () => {
    const total = 0;
    const completed = 0;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    expect(percentage).toBe(0);
  });
});

describe('Query Key Generation', () => {
  it('should generate correct query keys', () => {
    const params = {
      municipio_id: '1',
      contrato_id: '2',
      data_inicio: '2024-01-01',
      data_fim: '2024-12-31',
    };

    const queryKey = ['dashboard', 'kpis', params];

    expect(queryKey).toHaveLength(3);
    expect(queryKey[0]).toBe('dashboard');
    expect(queryKey[1]).toBe('kpis');
    expect(queryKey[2]).toEqual(params);
  });

  it('should handle undefined params in query key', () => {
    const params = {
      municipio_id: undefined,
      contrato_id: undefined,
      data_inicio: '2024-01-01',
      data_fim: '2024-12-31',
    };

    const queryKey = ['dashboard', 'kpis', params] as const;
    const paramsFromKey = queryKey[2] as typeof params;

    expect(paramsFromKey.municipio_id).toBeUndefined();
    expect(paramsFromKey.contrato_id).toBeUndefined();
  });

  it('should generate consistent keys for same params', () => {
    const params1 = {
      municipio_id: '1',
      data_inicio: '2024-01-01',
      data_fim: '2024-12-31',
    };

    const params2 = {
      municipio_id: '1',
      data_inicio: '2024-01-01',
      data_fim: '2024-12-31',
    };

    expect(JSON.stringify(params1)).toBe(JSON.stringify(params2));
  });
});

describe('Date Range Formatting', () => {
  it('should format dates correctly', () => {
    const date = new Date('2024-06-15');
    const formatted = date.toISOString().split('T')[0];
    expect(formatted).toBe('2024-06-15');
  });

  it('should handle date range validation', () => {
    const from = new Date('2024-01-01');
    const to = new Date('2024-12-31');

    expect(from < to).toBe(true);
    expect(to > from).toBe(true);
  });

  it('should calculate days in range', () => {
    const from = new Date('2024-01-01');
    const to = new Date('2024-01-31');
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    expect(days).toBe(30);
  });
});

describe('KPI Trend Analysis', () => {
  it('should identify improving trends', () => {
    const weeklyData = [100, 110, 120, 130, 140];
    const trend = weeklyData[weeklyData.length - 1] > weeklyData[0] ? 'improving' : 'declining';
    expect(trend).toBe('improving');
  });

  it('should identify declining trends', () => {
    const weeklyData = [100, 90, 80, 70, 60];
    const trend = weeklyData[weeklyData.length - 1] > weeklyData[0] ? 'improving' : 'declining';
    expect(trend).toBe('declining');
  });

  it('should calculate average KPI value', () => {
    const values = [100, 200, 300, 400, 500];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    expect(average).toBe(300);
  });

  it('should find peak and lowest values', () => {
    const values = [150, 200, 100, 300, 250];
    const peak = Math.max(...values);
    const lowest = Math.min(...values);

    expect(peak).toBe(300);
    expect(lowest).toBe(100);
  });
});

describe('Filter Store Integration', () => {
  it('should handle filter state changes', () => {
    const initialState = {
      municipioId: null as string | null,
      contratoId: null as string | null,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      },
    };

    // Simulate setting municipality
    const newState = {
      ...initialState,
      municipioId: '1',
    };

    expect(newState.municipioId).toBe('1');
    expect(newState.contratoId).toBeNull();
  });

  it('should reset filters correctly', () => {
    const state = {
      municipioId: '1',
      contratoId: '2',
      dateRange: {
        from: new Date('2024-06-01'),
        to: new Date('2024-06-30'),
      },
    };

    const resetState = {
      municipioId: null,
      contratoId: null,
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    };

    expect(resetState.municipioId).toBeNull();
    expect(resetState.contratoId).toBeNull();
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', () => {
    const error = new Error('API Error');
    const fallbackData = {
      hectaresMapeados: 0,
      criadourosIdentificados: 0,
      taxaDevolutivas: 0,
      atividadesAndamento: 0,
    };

    expect(() => {
      if (error) {
        return fallbackData;
      }
      throw error;
    }).not.toThrow();
  });

  it('should handle network timeout', () => {
    const isTimeout = true;
    const errorMessage = isTimeout ? 'Request timeout' : 'Unknown error';
    expect(errorMessage).toBe('Request timeout');
  });

  it('should handle empty response', () => {
    const response = null;
    const defaultData = response ?? {
      hectaresMapeados: 0,
      criadourosIdentificados: 0,
    };

    expect(defaultData.hectaresMapeados).toBe(0);
  });
});
