import type { Transaction, TransactionStatus, TransactionType } from '@/types/api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  conversion: 'Conversion',
  card_payment: 'Card payment',
  bill_payment: 'Bill payment',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
}

/**
 * Money coming into the wallet. A conversion is recorded in the currency received
 * (API.md: the history row is in the target currency), so it is a credit.
 */
const CREDIT_TYPES: ReadonlySet<TransactionType> = new Set(['deposit', 'transfer_in', 'conversion'])

export const isCredit = (tx: Pick<Transaction, 'type'>) => CREDIT_TYPES.has(tx.type)

/** "Ada Okafor" -> "AO", "Okonkwo-Adeyemi Logistics Ltd" -> "OA". */
export function initialsOf(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** One-line summary for the details hero, e.g. "Transfer out to Kwame Mensah". */
export function describeTransaction(tx: Pick<Transaction, 'type' | 'counterparty' | 'narration'>): string {
  if (tx.counterparty && tx.type === 'transfer_out') return `Transfer out to ${tx.counterparty}`
  if (tx.counterparty && tx.type === 'transfer_in') return `Transfer in from ${tx.counterparty}`
  return tx.narration
}
