import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsView } from './TransactionsView'

export const metadata: Metadata = { title: 'Transactions' }

/**
 * The page reads its state from the URL with useSearchParams, so it renders on the client below a
 * Suspense boundary (required for the static build; see Next's useSearchParams docs).
 */
export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsView />
    </Suspense>
  )
}
