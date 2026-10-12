'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader, Drawer } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTransactions({ limit: 5 })
      .then((res) => setTransactions(res.data))
      .finally(() => setIsLoading(false))
  }, [])

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
      {isLoading && <p className={styles.message}>Loading…</p>}
      {!isLoading && !transactions?.length && <p className={styles.message}>No transactions yet.</p>}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} showDate />
      ))}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && <TransactionDetails transaction={selected} />}
      </Drawer>
    </Card>
  )
}
