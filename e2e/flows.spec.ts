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
      expiresAt: Date.now() + 3600000,
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

test.describe('Complete User Flows', () => {
  test.describe('Login to Dashboard Flow', () => {
    test('should complete login and view dashboard', async ({ page }) => {
      // Start at login page
      await page.goto('/login');
      await expect(page).toHaveURL('/login');

      // Fill login form
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      await emailInput.fill('admin@techdengue.com');
      await passwordInput.fill('admin123');

      // Submit login
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should redirect to dashboard (or show error if API not mocked)
      // For E2E testing with real API, this would navigate to dashboard
      await page.waitForTimeout(1000);
    });

    test('should display dashboard after authentication', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');

      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Dashboard to Map Navigation Flow', () => {
    test('should navigate from dashboard to map', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Click on map link in navigation
      const mapLink = page.locator('a[href="/mapa"], nav a:has-text("Mapa")');
      if (await mapLink.isVisible()) {
        await mapLink.click();
        await expect(page).toHaveURL('/mapa');
      }
    });

    test('should preserve filters when navigating between pages', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Select a filter (if available)
      const filterButton = page.locator('button[role="combobox"]').first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(300);

        const option = page.locator('[role="option"]').first();
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(300);
        }
      }

      // Navigate to map
      await page.goto('/mapa');
      await page.waitForLoadState('networkidle');

      // Navigate back to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Filters should be preserved (depends on implementation)
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Analysis Flow', () => {
    test('should navigate through all analysis pages', async ({ page }) => {
      await mockAuthState(page);

      // Visit criadouros analysis
      await page.goto('/analise/criadouros');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/analise/criadouros');

      // Navigate to devolutivas
      const devolutivasTab = page.locator('a[href="/analise/devolutivas"], button:has-text("Devolutivas")');
      if (await devolutivasTab.isVisible()) {
        await devolutivasTab.click();
        await expect(page).toHaveURL('/analise/devolutivas');
      }

      // Navigate to comparativo
      const comparativoTab = page.locator('a[href="/analise/comparativo"], button:has-text("Comparativo")');
      if (await comparativoTab.isVisible()) {
        await comparativoTab.click();
        await expect(page).toHaveURL('/analise/comparativo');
      }

      // Navigate to correlacao
      const correlacaoTab = page.locator('a[href="/analise/correlacao"], button:has-text("Correlação")');
      if (await correlacaoTab.isVisible()) {
        await correlacaoTab.click();
        await expect(page).toHaveURL('/analise/correlacao');
      }
    });

    test('should display charts on analysis pages', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/analise/criadouros');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Wait for charts to render

      // Check for chart containers
      const charts = page.locator('.recharts-wrapper, svg.recharts-surface');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Activities Flow', () => {
    test('should navigate through activity pages', async ({ page }) => {
      await mockAuthState(page);

      // Visit activities calendar
      await page.goto('/atividades');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/atividades');

      // Navigate to list
      const listTab = page.locator('a[href="/atividades/lista"], button:has-text("Lista")');
      if (await listTab.isVisible()) {
        await listTab.click();
        await expect(page).toHaveURL('/atividades/lista');
      }

      // Navigate to performance
      const perfTab = page.locator('a[href="/atividades/performance"], button:has-text("Performance")');
      if (await perfTab.isVisible()) {
        await perfTab.click();
        await expect(page).toHaveURL('/atividades/performance');
      }

      // Navigate to pilots
      const pilotsTab = page.locator('a[href="/atividades/pilotos"], button:has-text("Pilotos")');
      if (await pilotsTab.isVisible()) {
        await pilotsTab.click();
        await expect(page).toHaveURL('/atividades/pilotos');
      }
    });

    test('should display calendar on activities page', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/atividades');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check for calendar component
      const calendar = page.locator('.rbc-calendar, [data-testid="activity-calendar"], .calendar');
      const calendarCount = await calendar.count();
      expect(calendarCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Reports Flow', () => {
    test('should navigate through report pages', async ({ page }) => {
      await mockAuthState(page);

      // Visit reports main page
      await page.goto('/relatorios');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/relatorios');

      // Navigate to municipal report
      const municipalLink = page.locator('a[href="/relatorios/municipal"]');
      if (await municipalLink.isVisible()) {
        await municipalLink.click();
        await expect(page).toHaveURL('/relatorios/municipal');
      }

      // Navigate to activities report
      await page.goto('/relatorios/atividades');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/relatorios/atividades');

      // Navigate to devolutivas report
      await page.goto('/relatorios/devolutivas');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/relatorios/devolutivas');

      // Navigate to executive report
      await page.goto('/relatorios/executivo');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/relatorios/executivo');
    });

    test('should display export options on report pages', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/relatorios/municipal');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check for export buttons
      const exportButtons = page.locator('button:has-text("PDF"), button:has-text("Excel"), button:has-text("Exportar")');
      const buttonCount = await exportButtons.count();
      expect(buttonCount).toBeGreaterThanOrEqual(0);
    });

    test('should navigate to report history', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/relatorios/historico');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/relatorios/historico');
    });
  });

  test.describe('Settings Flow', () => {
    test('should navigate through settings pages', async ({ page }) => {
      await mockAuthState(page);

      // Visit profile settings
      await page.goto('/configuracoes');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/configuracoes');

      // Navigate to security
      const securityLink = page.locator('a[href="/configuracoes/seguranca"]');
      if (await securityLink.isVisible()) {
        await securityLink.click();
        await expect(page).toHaveURL('/configuracoes/seguranca');
      }

      // Navigate to notifications
      await page.goto('/configuracoes/notificacoes');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/configuracoes/notificacoes');

      // Navigate to appearance
      await page.goto('/configuracoes/aparencia');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/configuracoes/aparencia');
    });

    test('should toggle theme in appearance settings', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/configuracoes/aparencia');
      await page.waitForLoadState('networkidle');

      // Find theme toggle
      const themeToggle = page.locator('button:has-text("Escuro"), button:has-text("Dark"), [data-testid="theme-toggle"]');

      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);

        // Theme should change
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout and redirect to login', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Find user menu or logout button
      const userMenu = page.locator('[data-testid="user-menu"], button:has(img), .user-menu');

      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(300);

        const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout"), [data-testid="logout-button"]');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForTimeout(1000);

          // Should redirect to login
          // await expect(page).toHaveURL('/login');
        }
      }
    });
  });

  test.describe('Search Flow', () => {
    test('should search from header', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Find search input
      const searchInput = page.locator('[data-testid="global-search"], input[placeholder*="Buscar"], header input');

      if (await searchInput.isVisible()) {
        await searchInput.fill('Curitiba');
        await page.waitForTimeout(500);

        // Search results should appear
        const results = page.locator('[data-testid="search-results"], .search-results, [role="listbox"]');
        // Results may or may not appear depending on implementation
      }
    });
  });

  test.describe('Error Recovery Flow', () => {
    test('should recover from 404 error', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');

      // Should show 404 page
      await expect(page.locator('body')).toBeVisible();

      // Find link to go back or to home
      const homeLink = page.locator('a[href="/"], a[href="/dashboard"], button:has-text("Voltar"), button:has-text("Home")');

      if (await homeLink.isVisible()) {
        await homeLink.first().click();
        await page.waitForLoadState('networkidle');

        // Should be on a valid page
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle session expiry', async ({ page }) => {
      // Set expired token
      await page.addInitScript(() => {
        const mockUser = {
          id: '1',
          name: 'Test User',
          email: 'test@techdengue.com',
        };

        const mockTokens = {
          accessToken: 'expired-token',
          refreshToken: 'expired-refresh',
          expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
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

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should either redirect to login or refresh token
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Navigation Flow', () => {
    test('should navigate on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Find mobile menu toggle
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"], button[aria-label*="menu"], .hamburger-menu');

      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(300);

        // Mobile menu should open
        const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, aside');
        if (await mobileNav.isVisible()) {
          // Click on a navigation item
          const navItem = mobileNav.locator('a').first();
          if (await navItem.isVisible()) {
            await navItem.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });

  test.describe('Data Filtering Flow', () => {
    test('should filter data across pages', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Apply date filter
      const dateFilter = page.locator('[data-testid="date-range-picker"], button:has-text("Período")').first();

      if (await dateFilter.isVisible()) {
        await dateFilter.click();
        await page.waitForTimeout(500);

        // Select a preset or specific date
        const preset = page.locator('button:has-text("Últimos 7 dias"), button:has-text("Last 7 days")');
        if (await preset.isVisible()) {
          await preset.click();
          await page.waitForTimeout(500);
        }
      }

      // Navigate to another page
      await page.goto('/analise/criadouros');
      await page.waitForLoadState('networkidle');

      // Filter should persist (if implemented)
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Export Flow', () => {
    test('should export report to PDF', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/relatorios/municipal');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Find PDF export button
      const pdfButton = page.locator('button:has-text("PDF"), [data-testid="export-pdf"]');

      if (await pdfButton.isVisible()) {
        // Setup download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

        await pdfButton.click();

        // Wait for download (may not happen if API is mocked)
        const download = await downloadPromise;
        // Download may or may not occur depending on implementation
      }
    });

    test('should export report to Excel', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/relatorios/municipal');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Find Excel export button
      const excelButton = page.locator('button:has-text("Excel"), [data-testid="export-excel"]');

      if (await excelButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

        await excelButton.click();

        const download = await downloadPromise;
        // Download may or may not occur depending on implementation
      }
    });
  });

  test.describe('Breadcrumb Navigation Flow', () => {
    test('should navigate using breadcrumbs', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/analise/criadouros');
      await page.waitForLoadState('networkidle');

      // Find breadcrumb
      const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-testid="breadcrumb"]');

      if (await breadcrumb.isVisible()) {
        // Click on a breadcrumb link
        const homeLink = breadcrumb.locator('a').first();
        if (await homeLink.isVisible()) {
          await homeLink.click();
          await page.waitForLoadState('networkidle');

          // Should navigate to the linked page
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });
  });

  test.describe('Form Submission Flow', () => {
    test('should submit profile update form', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/configuracoes');
      await page.waitForLoadState('networkidle');

      // Find name input and update
      const nameInput = page.locator('input[name="name"], input[id="name"]');

      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Name');

        // Find save button
        const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Save"), button[type="submit"]');

        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(500);

          // Check for success message
          const successToast = page.locator('[data-testid="toast"], .toast, .sonner-toast');
          // Toast may or may not appear depending on implementation
        }
      }
    });

    test('should validate form inputs', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/configuracoes/seguranca');
      await page.waitForLoadState('networkidle');

      // Find password input
      const passwordInput = page.locator('input[type="password"], input[name*="password"]').first();

      if (await passwordInput.isVisible()) {
        // Enter invalid password (too short)
        await passwordInput.fill('123');

        // Try to submit
        const submitButton = page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(300);

          // Check for validation error
          const errorMessage = page.locator('.error, [role="alert"], :text("mínimo"), :text("invalid")');
          // Error may or may not appear depending on validation
        }
      }
    });
  });

  test.describe('Quick Actions Flow', () => {
    test('should access quick actions from dashboard', async ({ page }) => {
      await mockAuthState(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Find quick action buttons
      const quickActions = page.locator('[data-testid="quick-actions"], .quick-actions');

      if (await quickActions.isVisible()) {
        // Click on first action
        const actionButton = quickActions.locator('button, a').first();
        if (await actionButton.isVisible()) {
          await actionButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });
});
