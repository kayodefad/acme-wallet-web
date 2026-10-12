import Link from 'next/link'
import type { Transaction } from '@/types/api'
import { Money } from '@/components/ui'
import { formatDateTime, formatTime, isCredit, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  /** Renders the row as a link (e.g. `?txn=<id>`) so details can be opened in a new tab or shared. */
  href?: string
  onSelect?: (transaction: Transaction) => void
  /** Show the full date and time. Off when the row sits under a day heading. */
  showDate?: boolean
}

export function TransactionRow({ transaction: tx, href, onSelect, showDate = false }: TransactionRowProps) {
  const credit = isCredit(tx)

  const content = (
    <>
      <TransactionAvatar transaction={tx} className={styles.avatar} />
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Plain text: narration comes from upstream providers and is not sanitised (API.md). */}
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <span className={styles.status}>
        <StatusBadge status={tx.status} />
      </span>
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        <span className={styles.time}>
          {showDate ? formatDateTime(tx.createdAt) : formatTime(tx.createdAt)}
        </span>
        <span className={styles.compactStatus}>
          <StatusBadge status={tx.status} />
        </span>
      </span>
    </>
  )

  return (
    <div className={styles.item}>
      {href ? (
        <Link href={href} scroll={false} className={styles.row} onClick={() => onSelect?.(tx)}>
          {content}
        </Link>
      ) : (
        <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
          {content}
        </button>
      )}
    </div>
  )
}
