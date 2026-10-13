import { expect, test, type Page } from '@playwright/test'

const subtitle = (page: Page) => page.locator('h1 + p')
const rows = (page: Page) => page.locator('a[href*="txn="]')
const search = (page: Page) => page.getByRole('searchbox', { name: 'Search' })

test.describe('Transactions page', () => {
  test('lists transactions with pagination', async ({ page }) => {
    await page.goto('/transactions')

    await expect(subtitle(page)).toHaveText('237 transactions')
    await expect(rows(page)).toHaveCount(20)
    await expect(page.getByText('Showing 1–20 of 237')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Page 1', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('renders unsanitised narration as text', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => warnings.push(msg.text()))
    await page.goto('/transactions')

    await expect(page.getByText(/Spectranet <img src="x"/)).toBeVisible()
    expect(warnings.join('\n')).not.toContain('narration rendered as HTML')
  })

  test('search is debounced into the URL and Back restores filters', async ({ page }) => {
    await page.goto('/transactions')
    await expect(subtitle(page)).toHaveText('237 transactions')

    await search(page).fill('ada')
    await expect(page).toHaveURL(/\?q=ada$/)
    await expect(subtitle(page)).toHaveText('9 results')

    await page.getByRole('combobox', { name: 'Status' }).click()
    await page.getByRole('option', { name: 'Successful' }).click()
    await expect(page).toHaveURL(/\?q=ada&status=successful$/)

    await page.goBack()
    await expect(page).toHaveURL(/\?q=ada$/)
    await expect(page.getByRole('combobox', { name: 'Status' })).toHaveText('All statuses')
    await expect(search(page)).toHaveValue('ada')
  })

  test('a search adds one history entry; refining it replaces that entry', async ({ page }) => {
    await page.goto('/transactions?page=2')
    await page.goto('/transactions')

    await search(page).fill('kw')
    await expect(page).toHaveURL(/\?q=kw$/) // starting a search pushes
    await search(page).fill('kwame')
    await expect(page).toHaveURL(/\?q=kwame$/) // refining replaces

    await page.goBack()
    await expect(page).toHaveURL(/\/transactions$/) // back to the unfiltered list, not "kw"
    await expect(search(page)).toHaveValue('')
    await page.goBack()
    await expect(page).toHaveURL(/\?page=2$/)
  })

  test('cancels a superseded search request', async ({ page }) => {
    const aborted: string[] = []
    page.on('requestfailed', (request) => {
      if (request.url().includes('/api/transactions?')) aborted.push(request.url())
    })
    // Every API call takes 3 s in this scenario, so the first search is still in flight.
    await page.goto('/transactions?__scenario=slow')

    await search(page).fill('a')
    await page.waitForRequest((r) => r.url().includes('q=a&') || r.url().endsWith('q=a'))
    await search(page).fill('ada')

    await expect(subtitle(page)).toHaveText('9 results', { timeout: 10_000 })
    expect(aborted.some((url) => /[?&]q=a(&|$)/.test(url))).toBe(true)
  })

  test('refresh and shared links keep the page and filters', async ({ page }) => {
    await page.goto('/transactions?status=successful&page=3')
    await expect(page.getByRole('link', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')

    await page.reload()
    await expect(page.getByRole('link', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('combobox', { name: 'Status' })).toHaveText('Successful')
  })

  test('ignores invalid URL values', async ({ page }) => {
    await page.goto('/transactions?status=reversed&page=-4')
    await expect(subtitle(page)).toHaveText('237 transactions')
    await expect(page.getByRole('link', { name: 'Page 1', exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('a page past the end goes to the last page without an empty state', async ({ page }) => {
    await page.goto('/transactions?page=99')
    await expect(page).toHaveURL(/\?page=12$/)
    await expect(page.getByRole('link', { name: 'Page 12' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByText('No transactions yet')).toHaveCount(0)
  })

  test('details open from a row, close with Escape and return focus', async ({ page }) => {
    await page.goto('/transactions')
    const row = rows(page).first()
    await row.click()

    const dialog = page.getByRole('dialog', { name: 'Transaction details' })
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL(/txn=/)
    await expect(dialog.getByText('Summary')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(/\/transactions$/)
    await expect(row).toBeFocused()
  })

  test('Back closes details opened from the list', async ({ page }) => {
    await page.goto('/transactions?page=2')
    await rows(page).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.goBack()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL(/\?page=2$/)
  })

  test('a shared details link opens the drawer on load', async ({ page }) => {
    await page.goto('/transactions?txn=txn_25bv')
    const dialog = page.getByRole('dialog', { name: 'Transaction details' })
    await expect(dialog.getByText('Transfer in from Ngozi Eze')).toBeVisible()

    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(page).toHaveURL(/\/transactions$/)
  })

  test('keeps Tab inside the open drawer', async ({ page }) => {
    await page.goto('/transactions?txn=txn_25bv')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Copy reference' })).toBeVisible()

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    }
  })

  test('selects a filter with the keyboard', async ({ page }) => {
    await page.goto('/transactions')
    await page.getByRole('combobox', { name: 'Type' }).focus()
    await page.keyboard.press('Enter')
    // Radix moves focus to the selected option once the panel is positioned; wait for it like a user would.
    await expect(page.getByRole('option', { name: 'All types' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Deposit' })).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\?type=deposit$/)
    await expect(page.getByRole('combobox', { name: 'Type' })).toHaveText('Deposit')
  })
})

test.describe('Transactions page states', () => {
  test('loading skeleton on first load', async ({ page }) => {
    await page.goto('/transactions?__scenario=slow')
    await expect(page.locator('[aria-busy="true"]').first()).toBeVisible()
    await expect(rows(page)).toHaveCount(20, { timeout: 10_000 })
  })

  test('empty account', async ({ page }) => {
    await page.goto('/transactions?__scenario=empty')
    await expect(page.getByText('No transactions yet')).toBeVisible()
    await expect(subtitle(page)).toHaveText('0 transactions')
  })

  test('no results for a search, then Clear filters', async ({ page }) => {
    await page.goto('/transactions?q=zzzz')
    await expect(page.getByText('No transactions match your filters')).toBeVisible()
    await expect(subtitle(page)).toHaveText('0 results')

    await page.getByRole('button', { name: 'Clear filters' }).last().click()
    await expect(page).toHaveURL(/\/transactions$/)
    await expect(subtitle(page)).toHaveText('237 transactions')
  })

  test('error with Try again', async ({ page }) => {
    await page.goto('/transactions?__scenario=error')
    // Next.js renders its own (empty) role=alert route announcer, so match ours by text.
    await expect(
      page.getByRole('alert').filter({ hasText: 'We couldn’t load your transactions' })
    ).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  test('details not found', async ({ page }) => {
    await page.goto('/transactions?txn=does-not-exist')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Transaction not found')).toBeVisible()

    await dialog.getByRole('button', { name: 'Back to transactions' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL(/\/transactions$/)
  })
})
