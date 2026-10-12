'use client'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '@/types/api'
import { Button, Input, Select } from '@/components/ui'
import { cx } from '@/lib/cx'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { useMediaQuery } from '@/lib/use-media-query'
import type { SearchPatch, TransactionFilters as Filters } from './search-params'
import styles from './page.module.css'

/** Long enough to skip intermediate keystrokes, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 300

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...TRANSACTION_TYPES.map((type) => ({ value: type, label: TRANSACTION_TYPE_LABELS[type] })),
]

// The design also lists "Reversed", which the API does not support; it is left out (see PR).
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...TRANSACTION_STATUSES.map((status) => ({ value: status, label: TRANSACTION_STATUS_LABELS[status] })),
]

export interface TransactionFiltersProps {
  filters: Filters
  onChange: (patch: SearchPatch, history: 'push' | 'replace') => void
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')

  // The input is local so typing stays instant; the URL catches up after the debounce.
  const [input, setInput] = useState(filters.q)
  const [syncedQ, setSyncedQ] = useState(filters.q)
  const [sentQ, setSentQ] = useState<string | null>(null)

  // The URL changed (Back, a shared link, Clear filters): show its value, unless it is the value we just
  // sent, in which case the user may have kept typing and their newer input wins.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q)
    if (filters.q !== sentQ) setInput(filters.q)
    setSentQ(null)
  }

  // Replace, not push: Back should leave the search, not replay every keystroke.
  const commitSearch = useDebouncedCallback((value: string) => {
    setSentQ(value.trim())
    onChange({ q: value }, 'replace')
  }, SEARCH_DEBOUNCE_MS)

  const canClear = filters.q !== '' || filters.type !== null || filters.status !== null || input.trim() !== ''

  const clear = () => {
    commitSearch.cancel()
    setInput('')
    onChange({ q: '', type: null, status: null }, 'push')
  }

  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder={isMobile ? 'Search reference, name…' : 'Search by reference, name or narration'}
        value={input}
        onChange={(event) => {
          setInput(event.target.value)
          commitSearch(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commitSearch.flush()
        }}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={filters.type ?? ''}
        onValueChange={(value) => onChange({ type: (value || null) as Filters['type'] }, 'push')}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status ?? ''}
        onValueChange={(value) => onChange({ status: (value || null) as Filters['status'] }, 'push')}
        fieldClassName={styles.status}
      />
      <Button
        variant="ghost"
        onClick={clear}
        className={cx(styles.clear, !canClear && styles.clearHidden)}
        aria-hidden={!canClear || undefined}
        tabIndex={canClear ? undefined : -1}
      >
        Clear filters
      </Button>
    </div>
  )
}
