'use client'
import type { Transaction } from '@/types/api'
import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { TransactionRow } from '@/components/transactions'
import { formatDayLabel, localDayKey } from '@/lib/format'
import styles from './page.module.css'

/** Groups consecutive rows by local calendar day; the API returns newest first. */
export function groupByDay(transactions: Transaction[], now = new Date()) {
  const groups: { key: string; label: string; items: Transaction[] }[] = []
  for (const tx of transactions) {
    const key = localDayKey(tx.createdAt)
    const current = groups[groups.length - 1]
    if (current?.key === key) current.items.push(tx)
    else groups.push({ key, label: formatDayLabel(tx.createdAt, now), items: [tx] })
  }
  return groups
}

export function TransactionList({
  transactions,
  hrefFor,
  onSelect,
  isUpdating,
}: {
  transactions: Transaction[]
  hrefFor: (tx: Transaction) => string
  onSelect: (tx: Transaction) => void
  isUpdating: boolean
}) {
  return (
    <Card padding="none" className={isUpdating ? styles.updating : undefined}>
      <div aria-busy={isUpdating}>
        {groupByDay(transactions).map((group) => (
          <section key={group.key} aria-label={group.label}>
            <h2 className={styles.day}>{group.label}</h2>
            {group.items.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} href={hrefFor(tx)} onSelect={onSelect} />
            ))}
          </section>
        ))}
      </div>
    </Card>
  )
}

export function TransactionListSkeleton() {
  return (
    <Card padding="none">
      <div aria-busy="true">
        <div className={styles.day}>
          <Skeleton width={64} height={10} />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <Skeleton shape="circle" height={40} />
            <span className={styles.skeletonMain}>
              <Skeleton width={120} />
              <Skeleton width={260} height={10} />
            </span>
            <span className={styles.skeletonEnd}>
              <Skeleton width={96} />
              <Skeleton width={40} height={10} />
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * Server-rendered stand-in for the whole page while the client view (which reads the URL) starts up:
 * the real header and filter layout with placeholder controls, plus the list skeleton. Avoids a blank
 * main area on first load.
 */
export function TransactionsPageSkeleton() {
  const field = (label: string, className: string) => (
    <div className={className}>
      <span className={styles.fallbackLabel}>{label}</span>
      <Skeleton height={40} className={styles.fallbackControl} />
    </div>
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>{' '}</p>
      </header>
      <div className={styles.filters} aria-hidden="true">
        {field('Search', styles.search)}
        {field('Type', styles.type)}
        {field('Status', styles.status)}
      </div>
      <TransactionListSkeleton />
    </div>
  )
}

export function TransactionListError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card padding="none">
      <div role="alert">
        <EmptyState
          tone="danger"
          icon="alert"
          title="We couldn’t load your transactions"
          description="Check your connection and try again."
          action={
            <Button iconLeft="refresh" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      </div>
    </Card>
  )
}

export function TransactionListEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <Card padding="none">
      {filtered ? (
        <EmptyState
          icon="search"
          title="No transactions match your filters"
          description="Try a different search term or remove some filters."
          action={
            <Button variant="secondary" onClick={onClear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon="inbox"
          title="No transactions yet"
          description="When you add money, send a transfer or pay with your card, it will show up here."
        />
      )}
    </Card>
  )
}
