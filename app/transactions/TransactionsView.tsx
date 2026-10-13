'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { Button, Drawer, EmptyState } from '@/components/ui'
import { TransactionDetails, TransactionDetailsSkeleton } from '@/components/transactions'
import { Pagination } from './Pagination'
import { useTransaction, useTransactions } from './queries'
import {
  hasActiveFilters,
  PAGE_SIZE,
  parseFilters,
  parseSelectedId,
  toTransactionQuery,
  withPatch,
  type SearchPatch,
} from './search-params'
import { TransactionFilters } from './TransactionFilters'
import {
  TransactionList,
  TransactionListEmpty,
  TransactionListError,
  TransactionListSkeleton,
} from './TransactionList'
import styles from './page.module.css'

const plural = (count: number, word: string) =>
  `${count.toLocaleString('en-NG')} ${word}${count === 1 ? '' : 's'}`

export function TransactionsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const selectedId = parseSelectedId(searchParams)
  const filtered = hasActiveFilters(filters)

  const href = (patch: SearchPatch) => `${pathname}${withPatch(searchParams, patch)}`
  const navigate = (patch: SearchPatch, history: 'push' | 'replace') =>
    router[history](href(patch), { scroll: false })

  const list = useTransactions(toTransactionQuery(filters))
  const meta = list.data?.meta

  // A shared link can point past the last page (e.g. after data changed): go to the last real page.
  useEffect(() => {
    if (meta && meta.total > 0 && filters.page > meta.totalPages) {
      router.replace(href({ page: meta.totalPages }), { scroll: false })
    }
    // href is rebuilt every render; meta and the requested page are what matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, filters.page])

  // Details opened from the list pushed a history entry, so closing goes Back to the list. Opened from a
  // shared link or after a refresh, there is no list entry to go back to, so closing replaces the URL.
  const openedFromList = useRef(false)
  const openDetails = () => {
    openedFromList.current = true
  }
  const closeDetails = () => {
    if (openedFromList.current) router.back()
    else router.replace(href({ txn: null }), { scroll: false })
    openedFromList.current = false
  }

  const clearFilters = () => navigate({ q: '', type: null, status: null }, 'push')

  let subtitle = ' '
  if (meta) subtitle = filtered ? plural(meta.total, 'result') : plural(meta.total, 'transaction')

  // The account has transactions but the URL asks for a page past the end; the effect above is about to
  // redirect. Show loading meanwhile: an empty state here would be false.
  const outOfRange = meta !== undefined && meta.total > 0 && filters.page > meta.totalPages

  let content
  if (outOfRange) {
    content = <TransactionListSkeleton />
  } else if (list.data && list.data.data.length > 0 && meta) {
    content = (
      <>
        <TransactionList
          transactions={list.data.data}
          hrefFor={(tx: Transaction) => href({ txn: tx.id })}
          onSelect={openDetails}
          isUpdating={list.isPlaceholderData}
        />
        {meta.totalPages > 1 && (
          <Pagination
            page={Math.min(filters.page, meta.totalPages)}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={PAGE_SIZE}
            hrefFor={(page) => href({ page })}
          />
        )}
      </>
    )
  } else if (meta?.total === 0) {
    // Decided from the total, not from "this page has no rows", so only a truly empty result says so.
    content = <TransactionListEmpty filtered={filtered} onClear={clearFilters} />
  } else if (list.isError) {
    content = <TransactionListError onRetry={() => list.refetch()} />
  } else {
    content = <TransactionListSkeleton />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {subtitle}
        </p>
      </header>

      <TransactionFilters filters={filters} onChange={navigate} />

      {content}

      <Drawer open={selectedId !== null} title="Transaction details" onClose={closeDetails}>
        {selectedId && <DetailsBody id={selectedId} onBack={closeDetails} />}
      </Drawer>
    </div>
  )
}

function DetailsBody({ id, onBack }: { id: string; onBack: () => void }) {
  const detail = useTransaction(id)

  if (detail.data) return <TransactionDetails transaction={detail.data} />

  if (detail.error instanceof ApiError && detail.error.status === 404) {
    return (
      <EmptyState
        icon="search"
        title="Transaction not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Button variant="secondary" onClick={onBack}>
            Back to transactions
          </Button>
        }
      />
    )
  }

  if (detail.isError) {
    return (
      <div role="alert">
        <EmptyState
          tone="danger"
          icon="alert"
          title="We couldn’t load this transaction"
          description="Check your connection and try again."
          action={
            <Button iconLeft="refresh" onClick={() => detail.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  return <TransactionDetailsSkeleton />
}
