'use client'
import { useEffect, useState, type ReactNode } from 'react'
import type { Transaction } from '@/types/api'
import { Icon, Money, Skeleton } from '@/components/ui'
import { describeTransaction, formatDateTime, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionDetails.module.css'

function Row({ label, children, total = false }: { label: string; children: ReactNode; total?: boolean }) {
  return (
    <div className={total ? `${styles.row} ${styles.total}` : styles.row}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission); the value stays selectable.
    }
  }

  return (
    <button type="button" className={styles.copy} onClick={copy} aria-label={copied ? 'Copied' : label}>
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      <span className="visually-hidden" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}

export function TransactionDetails({ transaction: tx }: { transaction: Transaction }) {
  const credit = isCredit(tx)

  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <TransactionAvatar transaction={tx} size="lg" />
        {/* Plain text: narration is unsanitised upstream data (API.md). */}
        <p className={styles.description}>{describeTransaction(tx)}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.amount}
        />
        <StatusBadge status={tx.status} />
      </div>

      <section className={styles.section} aria-labelledby="tx-details-heading">
        <h3 id="tx-details-heading" className={styles.sectionTitle}>
          Details
        </h3>
        <dl className={styles.list}>
          <Row label="Reference">
            <span className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton value={tx.reference} label="Copy reference" />
            </span>
          </Row>
          <Row label="Date">{formatDateTime(tx.createdAt)}</Row>
          <Row label="Type">{TRANSACTION_TYPE_LABELS[tx.type]}</Row>
          {tx.counterparty && <Row label="Counterparty">{tx.counterparty}</Row>}
          <Row label="Narration">{tx.narration}</Row>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="tx-summary-heading">
        <h3 id="tx-summary-heading" className={styles.sectionTitle}>
          Summary
        </h3>
        <dl className={styles.list}>
          <Row label="Amount">
            <Money amount={tx.amount} currency={tx.currency} />
          </Row>
          <Row label="Fee">
            <Money amount={tx.fee} currency={tx.currency} />
          </Row>
          {/* API.md: the fee is charged on top of the amount, in the same currency. */}
          <Row label="Total" total>
            <Money amount={tx.amount + tx.fee} currency={tx.currency} />
          </Row>
        </dl>
      </section>
    </div>
  )
}

export function TransactionDetailsSkeleton() {
  return (
    <div className={styles.details} aria-busy="true" aria-label="Loading transaction">
      <div className={styles.hero}>
        <Skeleton shape="circle" height={48} />
        <Skeleton width={160} height={12} />
        <Skeleton width={200} height={24} />
        <Skeleton shape="pill" width={84} height={22} />
      </div>
      <div className={styles.list}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.row}>
            <Skeleton width={90} />
            <Skeleton width={140} />
          </div>
        ))}
      </div>
    </div>
  )
}
