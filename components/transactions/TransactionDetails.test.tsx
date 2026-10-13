import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

const base: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

const totalRow = () => screen.getByText('Total').closest('div')

describe('TransactionDetails', () => {
  it('adds the fee to the total for money going out', () => {
    render(<TransactionDetails transaction={base} />)
    expect(totalRow()).toHaveTextContent('GH₵1,212.00')
  })

  it('totals a conversion as the amount received, not amount + fee', () => {
    render(
      <TransactionDetails
        transaction={{
          ...base,
          type: 'conversion',
          currency: 'NGN',
          amount: 3058969, // received
          fee: 45885, // source-side fee, converted at the same rate
          counterparty: null,
          narration: 'Converted USD to NGN',
        }}
      />
    )
    expect(totalRow()).toHaveTextContent('₦30,589.69')
  })

  it('renders narration as text and hides an empty counterparty', () => {
    render(
      <TransactionDetails
        transaction={{ ...base, counterparty: null, narration: '<b>Card payment</b>', type: 'card_payment' }}
      />
    )
    expect(screen.getAllByText('<b>Card payment</b>').length).toBeGreaterThan(0)
    expect(screen.queryByText('Counterparty')).not.toBeInTheDocument()
  })
})
