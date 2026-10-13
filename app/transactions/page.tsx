import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsPageSkeleton } from './TransactionList'
import { TransactionsView } from './TransactionsView'

export const metadata: Metadata = { title: 'Transactions' }

/**
 * The page reads its state from the URL with useSearchParams, so it renders on the client below a
 * Suspense boundary (required for the static build; see Next's useSearchParams docs). The fallback is
 * the page shell plus skeletons, so the first paint isn't blank.
 */
export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsPageSkeleton />}>
      <TransactionsView />
    </Suspense>
  )
}
