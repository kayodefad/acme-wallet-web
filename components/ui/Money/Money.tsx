import type { Currency } from '@/types/api'
import { cx } from '@/lib/cx'
import { formatMoney } from '@/lib/format'
import styles from './Money.module.css'

/** U+2212 MINUS SIGN, as in the design; screen readers announce it as "minus". */
const MINUS = '−'

export interface MoneyProps {
  /** Minor units. */
  amount: number
  currency: Currency
  /** Prefix with + or −. */
  sign?: 'credit' | 'debit'
  className?: string
}

export function Money({ amount, currency, sign, className }: MoneyProps) {
  const prefix = sign === 'credit' ? '+' : sign === 'debit' ? MINUS : ''
  return (
    <span className={cx(styles.money, className)}>
      {prefix}
      {formatMoney(amount, currency)}
    </span>
  )
}
