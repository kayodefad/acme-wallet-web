'use client'
import { useQuery } from '@tanstack/react-query'
import type { Currency } from '@/types/api'
import { Card, CardHeader } from '@/components/ui'
import { getRate } from '@/lib/api/endpoints'
import { formatTime } from '@/lib/format'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

export function RatesWidget({ base }: { base: Currency }) {
  const query = useQuery({
    queryKey: ['rates', QUOTES, base],
    queryFn: ({ signal }) =>
      Promise.all(QUOTES.map((quote) => getRate(quote, base, { signal }).then((res) => res.data))),
  })
  const rates = query.data
  const updatedAt = rates?.[0]?.updatedAt

  return (
    <Card>
      <CardHeader title="Today's rates" />
      <dl className={styles.list}>
        {QUOTES.map((quote, i) => {
          const rate = rates?.[i]
          return (
            <div key={quote} className={styles.row}>
              <dt>1 {quote}</dt>
              <dd className={styles.value}>{rate ? `${rate.rate} ${base}` : '—'}</dd>
            </div>
          )
        })}
      </dl>
      {updatedAt && <p className={styles.updated}>Updated {formatTime(updatedAt)}</p>}
      {query.isError && (
        <p className={styles.updated} role="alert">
          Rates are unavailable right now.
        </p>
      )}
    </Card>
  )
}
