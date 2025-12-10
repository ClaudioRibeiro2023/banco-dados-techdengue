import { test, expect } from '@playwright/test';

// Helper to mock authentication
async function mockAuthState(page: import('@playwright/test').Page) {
  // Set mock auth tokens in localStorage
  await page.addInitScript(() => {
    const mockUser = {
      id: '1',
      nome: 'Usuário Teste',
      email: 'teste@techdengue.com',
      perfil: 'admin',
      municipio_id: '123',
      contrato_id: '456',
    };

    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: mockUser,
        token: 'mock-jwt-token',
        isAuthenticated: true,
        isLoading: false,
      },
      version: 0,
    }));
  });
}

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard|painel/i })).toBeVisible();
  });

  test('should navigate to mapa', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on map menu item
    await page.getByRole('link', { name: /mapa/i }).click();
    await expect(page).toHaveURL(/mapa/);
  });

  test('should navigate to análises', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on analysis menu item
    await page.getByRole('link', { name: /anális/i }).click();
    await expect(page).toHaveURL(/analise/);
  });

  test('should navigate to atividades', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on activities menu item
    await page.getByRole('link', { name: /atividade/i }).click();
    await expect(page).toHaveURL(/atividades/);
  });

  test('should navigate to relatórios', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on reports menu item
    await page.getByRole('link', { name: /relat/i }).click();
    await expect(page).toHaveURL(/relatorios/);
  });

  test('should navigate to configurações', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on settings menu item
    await page.getByRole('link', { name: /config/i }).click();
    await expect(page).toHaveURL(/configuracoes/);
  });
});

test.describe('Análises Subnavigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/analise');
  });

  test('should navigate to criadouros analysis', async ({ page }) => {
    await page.getByRole('link', { name: /criadouros/i }).click();
    await expect(page).toHaveURL(/analise\/criadouros/);
  });

  test('should navigate to devolutivas analysis', async ({ page }) => {
    await page.getByRole('link', { name: /devolutivas/i }).click();
    await expect(page).toHaveURL(/analise\/devolutivas/);
  });

  test('should navigate to comparativo analysis', async ({ page }) => {
    await page.getByRole('link', { name: /comparativo/i }).click();
    await expect(page).toHaveURL(/analise\/comparativo/);
  });

  test('should navigate to correlação climática', async ({ page }) => {
    await page.getByRole('link', { name: /correla|clima/i }).click();
    await expect(page).toHaveURL(/analise\/correlacao/);
  });
});

test.describe('Atividades Subnavigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/atividades');
  });

  test('should show calendar by default', async ({ page }) => {
    // Calendar should be visible
    await expect(page.locator('.rbc-calendar, [class*="calendar"]')).toBeVisible();
  });

  test('should navigate to lista', async ({ page }) => {
    await page.getByRole('link', { name: /lista/i }).click();
    await expect(page).toHaveURL(/atividades\/lista/);
  });

  test('should navigate to performance', async ({ page }) => {
    await page.getByRole('link', { name: /performance/i }).click();
    await expect(page).toHaveURL(/atividades\/performance/);
  });

  test('should navigate to pilotos', async ({ page }) => {
    await page.getByRole('link', { name: /piloto/i }).click();
    await expect(page).toHaveURL(/atividades\/pilotos/);
  });
});

test.describe('Relatórios Subnavigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/relatorios');
  });

  test('should navigate to municipal report', async ({ page }) => {
    await page.getByRole('link', { name: /municipal/i }).click();
    await expect(page).toHaveURL(/relatorios\/municipal/);
  });

  test('should navigate to atividades report', async ({ page }) => {
    await page.getByRole('link', { name: /atividades/i }).click();
    await expect(page).toHaveURL(/relatorios\/atividades/);
  });

  test('should navigate to devolutivas report', async ({ page }) => {
    await page.getByRole('link', { name: /devolutivas/i }).click();
    await expect(page).toHaveURL(/relatorios\/devolutivas/);
  });

  test('should navigate to executivo report', async ({ page }) => {
    await page.getByRole('link', { name: /executivo/i }).click();
    await expect(page).toHaveURL(/relatorios\/executivo/);
  });
});

test.describe('Configurações Subnavigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
    await page.goto('/configuracoes');
  });

  test('should show profile by default', async ({ page }) => {
    await expect(page.getByText(/perfil|informações/i)).toBeVisible();
  });

  test('should navigate to segurança', async ({ page }) => {
    await page.getByRole('link', { name: /seguran/i }).click();
    await expect(page).toHaveURL(/configuracoes\/seguranca/);
  });

  test('should navigate to notificações', async ({ page }) => {
    await page.getByRole('link', { name: /notifica/i }).click();
    await expect(page).toHaveURL(/configuracoes\/notificacoes/);
  });

  test('should navigate to aparência', async ({ page }) => {
    await page.getByRole('link', { name: /apar/i }).click();
    await expect(page).toHaveURL(/configuracoes\/aparencia/);
  });
});

test.describe('Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test('should show breadcrumbs on nested pages', async ({ page }) => {
    await page.goto('/analise/criadouros');

    // Should have breadcrumb links
    const breadcrumbs = page.locator('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]');
    await expect(breadcrumbs).toBeVisible();
  });

  test('should navigate via breadcrumbs', async ({ page }) => {
    await page.goto('/analise/criadouros');

    // Click on parent breadcrumb
    const analysisLink = page.getByRole('link', { name: /anális/i }).first();
    if (await analysisLink.isVisible()) {
      await analysisLink.click();
      await expect(page).toHaveURL(/analise/);
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/dashboard');

    // Should have hamburger menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Click menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // Sidebar should be visible
    await expect(page.locator('nav[class*="sidebar"], aside')).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-that-does-not-exist');

    // Should show 404 content
    await expect(page.getByText(/404|não encontrad/i)).toBeVisible();
  });

  test('should have link to dashboard', async ({ page }) => {
    await page.goto('/unknown-route');

    // Should have link to go back
    const dashboardLink = page.getByRole('link', { name: /dashboard|início|voltar/i });
    await expect(dashboardLink).toBeVisible();
  });
});
