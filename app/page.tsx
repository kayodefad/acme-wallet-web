'use client'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { Button, Card, EmptyState } from '@/components/ui'
import { useMe } from '@/lib/api/use-me'
import styles from './page.module.css'

export default function DashboardPage() {
  const me = useMe()

  if (me.isPending) return <p className={styles.loading}>Loading…</p>
  if (me.isError) {
    return (
      <Card padding="none">
        <div role="alert">
          <EmptyState
            tone="danger"
            icon="alert"
            title="We couldn’t load your dashboard"
            description="Check your connection and try again."
            action={
              <Button iconLeft="refresh" onClick={() => me.refetch()}>
                Try again
              </Button>
            }
          />
        </div>
      </Card>
    )
  }
  const user = me.data

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back, {user.firstName}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user.wallets} />

      <div className={styles.wallets}>
        {user.wallets.map((wallet) => (
          <WalletCard key={wallet.currency} wallet={wallet} />
        ))}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
