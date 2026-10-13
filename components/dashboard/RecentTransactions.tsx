'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, CardHeader, Drawer } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  // Same key shape as the Transactions page (['transactions', 'list', query]), so details can reuse it.
  const recent = useQuery({
    queryKey: ['transactions', 'list', { limit: 5 }],
    queryFn: ({ signal }) => getTransactions({ limit: 5 }, { signal }),
  })
  const transactions = recent.data?.data

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {recent.isPending && <p className={styles.message}>Loading…</p>}
      {recent.isError && (
        <div role="alert" className={styles.message}>
          We couldn’t load your recent transactions.{' '}
          <Button variant="ghost" size="sm" onClick={() => recent.refetch()}>
            Try again
          </Button>
        </div>
      )}
      {recent.isSuccess && !transactions?.length && <p className={styles.message}>No transactions yet.</p>}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} showDate />
      ))}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && <TransactionDetails transaction={selected} />}
      </Drawer>
    </Card>
  )
}
