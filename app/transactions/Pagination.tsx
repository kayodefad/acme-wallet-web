import Link from 'next/link'
import { Icon } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './page.module.css'

export type PageItem = number | 'gap'

/** First, last, and the pages around the current one, e.g. 1 2 3 … 12 or 1 … 5 6 7 … 12. */
export function pageItems(current: number, total: number): PageItem[] {
  const pages = new Set([1, total, current - 1, current, current + 1])
  if (current <= 2) [2, 3].forEach((p) => pages.add(p))
  if (current >= total - 1) [total - 1, total - 2].forEach((p) => pages.add(p))

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const items: PageItem[] = []
  sorted.forEach((page, i) => {
    const previous = sorted[i - 1]
    if (previous !== undefined && page - previous === 2) items.push(page - 1)
    else if (previous !== undefined && page - previous > 2) items.push('gap')
    items.push(page)
  })
  return items
}

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  hrefFor: (page: number) => string
}

function StepLink({
  page,
  enabled,
  hrefFor,
  direction,
}: {
  page: number
  enabled: boolean
  hrefFor: (p: number) => string
  direction: 'prev' | 'next'
}) {
  const label = direction === 'prev' ? 'Previous page' : 'Next page'
  const content =
    direction === 'prev' ? (
      <>
        <Icon name="chevron-left" size={16} />
        <span className={styles.long}>Previous</span>
        <span className={styles.short}>Prev</span>
      </>
    ) : (
      <>
        <span>Next</span>
        <Icon name="chevron-right" size={16} />
      </>
    )

  if (!enabled) {
    return (
      // A link with no href, so it can't be activated; role + aria-disabled let screen readers announce
      // "Previous page, disabled" (a name on a plain span is ignored).
      <span
        className={cx(styles.step, styles.stepDisabled)}
        role="link"
        aria-disabled="true"
        aria-label={label}
      >
        {content}
      </span>
    )
  }
  return (
    <Link href={hrefFor(page)} className={styles.step} aria-label={label}>
      {content}
    </Link>
  )
}

export function Pagination({ page, totalPages, total, pageSize, hrefFor }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        Showing {first}–{last} of {total}
      </p>
      <div className={styles.pages}>
        <StepLink page={page - 1} enabled={page > 1} hrefFor={hrefFor} direction="prev" />
        <ol className={styles.pageList}>
          {pageItems(page, totalPages).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item}>
                <Link
                  href={hrefFor(item)}
                  className={cx(styles.pageLink, item === page && styles.pageCurrent)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Link>
              </li>
            )
          )}
        </ol>
        <p className={styles.pageOf}>
          Page {page} of {totalPages}
        </p>
        <StepLink page={page + 1} enabled={page < totalPages} hrefFor={hrefFor} direction="next" />
      </div>
    </nav>
  )
}
