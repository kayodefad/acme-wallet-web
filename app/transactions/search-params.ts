import type { TransactionQuery } from '@/lib/api/endpoints'
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionStatus,
  type TransactionType,
} from '@/types/api'

/**
 * The URL is the source of truth for the page: refresh, shared links and Back all restore the same
 * view. Unknown or malformed values are ignored rather than sent to the API.
 */
export interface TransactionFilters {
  q: string
  type: TransactionType | null
  status: TransactionStatus | null
  page: number
}

export const PAGE_SIZE = 20

/** Query keys owned by this page. Anything else in the URL (e.g. `__scenario`) is preserved. */
const KEYS = { q: 'q', type: 'type', status: 'status', page: 'page', txn: 'txn' } as const

const includes = <T extends string>(list: readonly T[], value: string | null): value is T =>
  value !== null && (list as readonly string[]).includes(value)

export function parseFilters(params: URLSearchParams): TransactionFilters {
  const type = params.get(KEYS.type)
  const status = params.get(KEYS.status)
  const page = Number(params.get(KEYS.page))

  return {
    q: params.get(KEYS.q)?.trim() ?? '',
    type: includes(TRANSACTION_TYPES, type) ? type : null,
    status: includes(TRANSACTION_STATUSES, status) ? status : null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

export const parseSelectedId = (params: URLSearchParams) => params.get(KEYS.txn) || null

export const hasActiveFilters = (filters: TransactionFilters) =>
  filters.q !== '' || filters.type !== null || filters.status !== null

export function toTransactionQuery(filters: TransactionFilters): TransactionQuery {
  return {
    page: filters.page,
    limit: PAGE_SIZE,
    q: filters.q || undefined,
    type: filters.type ?? undefined,
    status: filters.status ?? undefined,
  }
}

export type SearchPatch = Partial<TransactionFilters> & { txn?: string | null }

/**
 * Returns a new query string with `patch` applied. Changing the search or a filter resets the page,
 * since page 7 of the old results means nothing for the new ones. Defaults are left out of the URL.
 */
export function withPatch(current: URLSearchParams, patch: SearchPatch): string {
  const next = new URLSearchParams(current)
  const set = (key: string, value: string | number | null | undefined, empty: string | number = '') => {
    if (value === undefined) return
    if (value === null || value === empty) next.delete(key)
    else next.set(key, String(value))
  }

  // Drop owned params the page ignored as invalid (e.g. ?status=reversed, ?page=-4), so the URL matches
  // what's on screen instead of carrying them into every link.
  const parsed = parseFilters(current)
  if (parsed.type === null) next.delete(KEYS.type)
  if (parsed.status === null) next.delete(KEYS.status)
  if (parsed.page === 1) next.delete(KEYS.page)
  if (parsed.q === '') next.delete(KEYS.q)

  set(KEYS.q, patch.q?.trim())
  set(KEYS.type, patch.type)
  set(KEYS.status, patch.status)
  set(KEYS.txn, patch.txn)

  const filtersChanged = patch.q !== undefined || patch.type !== undefined || patch.status !== undefined
  if (filtersChanged) next.delete(KEYS.page)
  set(KEYS.page, patch.page, 1)

  const qs = next.toString()
  return qs ? `?${qs}` : ''
}
