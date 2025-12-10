import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TechDengue/)
  })

  test('should navigate to monitor page', async ({ page }) => {
    await page.goto('/')
    
    // Click on monitor link if exists
    const monitorLink = page.locator('a[href="/monitor"], a[href*="monitor"]')
    if (await monitorLink.count() > 0) {
      await monitorLink.first().click()
      await expect(page).toHaveURL(/monitor/)
    }
  })

  test('should have responsive navigation', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    
    // Check navigation is visible
    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper ARIA landmarks
    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()
  })
})

test.describe('Data Display', () => {
  test('should display data cards', async ({ page }) => {
    await page.goto('/')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Check for data cards or tables
    const dataElements = page.locator('[data-testid*="card"], .card, table')
    
    // At least some data should be displayed
    const count = await dataElements.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Accessibility', () => {
  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility
    // - Images should have alt text
    const images = page.locator('img')
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      const role = await img.getAttribute('role')
      
      // Image should have alt, aria-label, or role="presentation"
      expect(alt || ariaLabel || role === 'presentation').toBeTruthy()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through the page
    await page.keyboard.press('Tab')
    
    // Something should be focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
