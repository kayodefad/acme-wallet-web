import { expect, test } from '@playwright/test'

test.describe('Transactions page at 375px', () => {
  test('has no horizontal scroll and keeps navigation', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page.locator('h1 + p')).toHaveText('237 transactions')

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)

    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link', { name: 'Transactions' })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })

  test('uses compact pagination', async ({ page }) => {
    await page.goto('/transactions')
    await expect(page.getByText('Page 1 of 12')).toBeVisible()
    await expect(page.getByText('Showing 1–20 of 237')).toBeHidden()
  })

  test('opens details as a bottom sheet', async ({ page }) => {
    await page.goto('/transactions')
    await page.locator('a[href*="txn="]').first().click()

    const dialog = page.getByRole('dialog', { name: 'Transaction details' })
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    expect(box?.width).toBe(375)
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(812)
  })
})
