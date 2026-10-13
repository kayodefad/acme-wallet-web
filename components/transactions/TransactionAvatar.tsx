import type { Transaction, TransactionType } from '@/types/api'
import { Icon, type IconName } from '@/components/ui'
import { cx } from '@/lib/cx'
import { initialsOf } from '@/lib/format'
import styles from './TransactionAvatar.module.css'

const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

export interface TransactionAvatarProps {
  transaction: Pick<Transaction, 'type' | 'counterparty'>
  size?: 'md' | 'lg'
  className?: string
}

/** Counterparty initials for transfers, otherwise an icon for the transaction type. Decorative. */
export function TransactionAvatar({ transaction, size = 'md', className }: TransactionAvatarProps) {
  const initials = transaction.counterparty ? initialsOf(transaction.counterparty) : ''
  return (
    <span className={cx(styles.avatar, styles[size], className)} aria-hidden="true">
      {initials || <Icon name={TYPE_ICONS[transaction.type]} size={18} />}
    </span>
  )
}
