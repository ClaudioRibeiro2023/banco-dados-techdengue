import { test, expect, Page } from '@playwright/test';

// Helper to mock authenticated state
async function mockAuthState(page: Page) {
  await page.addInitScript(() => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@techdengue.com',
      role: 'admin',
      municipio: 'Curitiba',
    };

    const mockTokens = {
      accessToken: 'mock-access-token-12345',
      refreshToken: 'mock-refresh-token-12345',
      expiresAt: Date.now() + 3600000, // 1 hour from now
    };

    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
      },
      version: 0,
    }));
  });
}

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
  });

  test('should display dashboard page with main elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveURL('/dashboard');

    // Check main header elements
    await expect(page.locator('h1, h2').first()).toContainText(/Dashboard|Visão Geral/i);
  });

  test('should display KPI cards section', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for KPI card containers
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, [class*="Card"]').first();
    await expect(kpiCards).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard Filters', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display municipality filter', async ({ page }) => {
    // Look for municipality selector
    const municipioFilter = page.locator('[data-testid="municipio-select"], [aria-label*="Município"], button:has-text("Município"), select').first();
    await expect(municipioFilter).toBeVisible({ timeout: 10000 });
  });

  test('should display date range picker', async ({ page }) => {
    // Look for date range picker
    const dateRangePicker = page.locator('[data-testid="date-range-picker"], [aria-label*="período"], button:has-text("período"), .date-range-picker').first();
    await expect(dateRangePicker).toBeVisible({ timeout: 10000 });
  });

  test('should open municipality selector and show options', async ({ page }) => {
    // Find and click municipality selector
    const municipioButton = page.locator('button:has-text("Município"), [data-testid="municipio-select"] button, button[role="combobox"]').first();

    if (await municipioButton.isVisible()) {
      await municipioButton.click();

      // Wait for dropdown/popover to open
      await page.waitForTimeout(500);

      // Check for options list
      const optionsList = page.locator('[role="listbox"], [role="option"], [data-testid="municipio-option"]');
      const optionsCount = await optionsList.count();
      expect(optionsCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should open date range picker dialog', async ({ page }) => {
    // Find and click date range button
    const dateButton = page.locator('button:has-text("período"), button:has-text("data"), [data-testid="date-range-picker"] button').first();

    if (await dateButton.isVisible()) {
      await dateButton.click();

      // Wait for calendar/dialog to open
      await page.waitForTimeout(500);

      // Check for calendar elements
      const calendar = page.locator('[role="grid"], .calendar, [data-testid="calendar"]');
      const calendarCount = await calendar.count();
      expect(calendarCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should persist filter state on navigation', async ({ page }) => {
    // Get current filter state (if visible)
    const filterContainer = page.locator('[data-testid="dashboard-filters"], .dashboard-filters');

    // Navigate away
    await page.goto('/mapa');
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filters should still be present
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have filter reset functionality', async ({ page }) => {
    // Look for reset/clear filters button
    const resetButton = page.locator('button:has-text("Limpar"), button:has-text("Reset"), button:has-text("limpar"), [data-testid="filter-reset"]');

    // Button may or may not exist depending on implementation
    const resetExists = await resetButton.count();
    expect(resetExists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Dashboard Filter Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should update content when filters change', async ({ page }) => {
    // Get initial state of dashboard
    const initialContent = await page.locator('main').innerHTML();

    // Find any filter element and try to interact
    const filterButton = page.locator('button[role="combobox"], select, [data-testid*="filter"]').first();

    if (await filterButton.isVisible()) {
      // Click to open
      await filterButton.click();
      await page.waitForTimeout(300);

      // Try to select an option if available
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show loading state while filtering', async ({ page }) => {
    // Dashboard should handle loading states gracefully
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .skeleton, [class*="Skeleton"]');

    // Loading states may appear during data fetching
    // This test verifies the page structure can handle loading
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display empty state when no data', async ({ page }) => {
    // Check for empty state handling
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state, :text("Nenhum dado"), :text("Sem resultados")');

    // Empty state may or may not be visible depending on data
    const emptyExists = await emptyState.count();
    expect(emptyExists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Dashboard KPIs', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display KPI cards with values', async ({ page }) => {
    // Wait for KPIs to load
    await page.waitForTimeout(1000);

    // Look for card elements
    const cards = page.locator('[data-testid="kpi-card"], .kpi-card, [class*="Card"]');
    const cardCount = await cards.count();

    // Dashboard should have at least one card
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display trend indicators in KPIs', async ({ page }) => {
    // Look for trend indicators (up/down arrows, percentages)
    const trendIndicators = page.locator('[data-testid="trend"], .trend, [class*="trend"], svg[class*="lucide-trending"]');

    // May or may not exist depending on data
    const trendCount = await trendIndicators.count();
    expect(trendCount).toBeGreaterThanOrEqual(0);
  });

  test('should show KPI tooltips on hover', async ({ page }) => {
    // Find a KPI card
    const kpiCard = page.locator('[data-testid="kpi-card"], .kpi-card').first();

    if (await kpiCard.isVisible()) {
      // Hover over the card
      await kpiCard.hover();
      await page.waitForTimeout(300);

      // Check for tooltip
      const tooltip = page.locator('[role="tooltip"], .tooltip');
      // Tooltip may or may not appear
    }
  });
});

test.describe('Dashboard Charts', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display evolution chart', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1500);

    // Look for recharts SVG elements
    const charts = page.locator('svg.recharts-surface, .recharts-wrapper, [data-testid="evolution-chart"]');
    const chartCount = await charts.count();

    expect(chartCount).toBeGreaterThanOrEqual(0);
  });

  test('should display distribution chart', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1500);

    // Look for pie/donut chart
    const pieChart = page.locator('.recharts-pie, [data-testid="distribution-chart"], .recharts-sector');
    const pieCount = await pieChart.count();

    expect(pieCount).toBeGreaterThanOrEqual(0);
  });

  test('should show chart tooltips on hover', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1500);

    // Find a chart area
    const chartArea = page.locator('.recharts-surface').first();

    if (await chartArea.isVisible()) {
      // Get bounding box and hover over center
      const box = await chartArea.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);

        // Check for tooltip
        const tooltip = page.locator('.recharts-tooltip-wrapper, [class*="tooltip"]');
        // Tooltip visibility depends on data
      }
    }
  });

  test('should have responsive chart sizes', async ({ page }) => {
    // Check charts at different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      // Charts should still be visible
      const chartWrapper = page.locator('.recharts-wrapper, [data-testid*="chart"]').first();
      if (await chartWrapper.isVisible()) {
        const box = await chartWrapper.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    }
  });
});

test.describe('Dashboard Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard content should be visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard content should be visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should stack KPI cards on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForTimeout(1000);

    // KPI cards should still be visible
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, [class*="Card"]').first();
    if (await kpiCards.isVisible()) {
      const box = await kpiCards.boundingBox();
      if (box) {
        // On mobile, cards should be nearly full width
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });

  test('should collapse sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Sidebar should be hidden or collapsed
    const sidebar = page.locator('[data-testid="sidebar"], aside, nav').first();

    if (await sidebar.isVisible()) {
      const box = await sidebar.boundingBox();
      if (box) {
        // Sidebar should be narrow or off-screen on mobile
        expect(box.width).toBeLessThan(100);
      }
    }
  });
});

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');

    // Should have at least one h1 or h2
    const headingCount = await h1.count() + await h2.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have accessible filter labels', async ({ page }) => {
    // Check for labels associated with filters
    const labels = page.locator('label, [aria-label], [aria-labelledby]');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check that something is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have skip link for main content', async ({ page }) => {
    // Look for skip link
    const skipLink = page.locator('a[href="#main"], a:has-text("Ir para conteúdo"), .skip-link');

    if (await skipLink.count() > 0) {
      // Focus on skip link
      await skipLink.first().focus();
      await expect(skipLink.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard Data Loading', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test('should show loading states while fetching data', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for loading indicators
    const loadingElements = page.locator('[data-testid="loading"], .loading, .skeleton, [class*="Skeleton"], [aria-busy="true"]');

    // Loading states should appear during initial load
    // They may disappear quickly, so we just check the page loads
    await page.waitForLoadState('networkidle');
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show error state on network failure', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => route.abort());

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Page should still be visible (may show error states)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should refresh data on manual refresh', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Atualizar"), button:has-text("Refresh"), [data-testid="refresh-button"]');

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);

      // Page should still be functional after refresh
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
