import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { TransactionsView } from './TransactionsView'

const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
let search = ''

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/transactions',
  useSearchParams: () => new URLSearchParams(search),
}))

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 1549,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: '2026-10-05T14:22:00.000Z',
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status })
const page = (data: Transaction[], total = data.length) =>
  json(200, { data, meta: { page: 1, limit: 20, total, totalPages: Math.max(1, Math.ceil(total / 20)) } })

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <TransactionsView />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  search = ''
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TransactionsView', () => {
  it('lists transactions with the total in the header', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(page([tx], 237))
    renderView()

    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
    expect(screen.getByText('237 transactions')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Card payment - Netflix/ })).toHaveAttribute(
      'href',
      '/transactions?txn=txn_1'
    )
  })

  it('sends the URL filters to the API', async () => {
    search = 'q=netflix&status=failed&page=2'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(page([tx], 30))
    renderView()

    await screen.findByText('Card payment - Netflix')
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/transactions?page=2&limit=20&q=netflix&status=failed')
    expect(screen.getByText('30 results')).toBeInTheDocument()
  })

  it('shows the error state and retries', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        json(500, { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
      )
      .mockResolvedValueOnce(page([tx]))
    renderView()

    expect(await screen.findByText('We couldn’t load your transactions')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('distinguishes an empty account from a filtered search with no results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(page([]))
    const { unmount } = renderView()
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
    unmount()

    search = 'q=zzz'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(page([]))
    renderView()
    expect(await screen.findByText('No transactions match your filters')).toBeInTheDocument()
    expect(screen.getByText('0 results')).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[1])
    expect(router.push).toHaveBeenCalledWith('/transactions', { scroll: false })
  })

  it('shows the not-found state for a shared link to a missing transaction', async () => {
    search = 'txn=txn_missing'
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
      String(input).includes('/transactions/txn_missing')
        ? json(404, { error: { code: 'NOT_FOUND', message: 'Transaction txn_missing not found' } })
        : page([tx])
    )
    renderView()

    expect(await screen.findByText('Transaction not found')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Back to transactions' }))
    expect(router.replace).toHaveBeenCalledWith('/transactions', { scroll: false })
  })
})
