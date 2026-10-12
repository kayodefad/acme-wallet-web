import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'bill_payment',
  status: 'failed',
  currency: 'USD',
  amount: 2999,
  fee: 30,
  narration: `Bill payment - Spectranet <img src="x" onerror="alert(1)">`,
  counterparty: null,
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionRow', () => {
  it('renders narration as text, never as HTML', () => {
    const { container } = render(<TransactionRow transaction={tx} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(tx.narration)).toBeInTheDocument()
  })

  it('shows a debit in the transaction currency with its status', () => {
    const { container } = render(<TransactionRow transaction={tx} />)
    expect(container).toHaveTextContent('−$29.99')
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0)
  })

  it('shows counterparty initials for transfers and + for credits', () => {
    const { container } = render(
      <TransactionRow
        transaction={{
          ...tx,
          type: 'transfer_in',
          counterparty: 'Ada Okafor',
          currency: 'NGN',
          amount: 2500000,
        }}
      />
    )
    expect(screen.getByText('AO')).toBeInTheDocument()
    expect(container).toHaveTextContent('+₦25,000.00')
  })

  it('reports the selected transaction', async () => {
    const onSelect = vi.fn()
    render(<TransactionRow transaction={tx} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(tx)
  })

  it('renders as a link when given an href', () => {
    render(<TransactionRow transaction={tx} href="/transactions?txn=txn_1" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/transactions?txn=txn_1')
  })
})
