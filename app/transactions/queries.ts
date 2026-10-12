import { keepPreviousData, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { ApiSuccess, Transaction } from '@/types/api'
import { getTransaction, getTransactions, type TransactionQuery } from '@/lib/api/endpoints'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (query: TransactionQuery) => [...transactionKeys.lists(), query] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

/**
 * One cache entry per (search, filters, page). TanStack Query aborts the request for a key we no longer
 * need (so a slow search can't overwrite a newer one), and `keepPreviousData` keeps the current page on
 * screen while the next one loads, as the design asks.
 */
export function useTransactions(query: TransactionQuery) {
  return useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: ({ signal }) => getTransactions(query, { signal }),
    placeholderData: keepPreviousData,
  })
}

/** A row the user clicked is already in a cached list page, so details can render without waiting. */
function findInLists(queryClient: QueryClient, id: string) {
  for (const [, page] of queryClient.getQueriesData<ApiSuccess<Transaction[]>>({
    queryKey: transactionKeys.lists(),
  })) {
    const match = page?.data.find((tx) => tx.id === id)
    if (match) return match
  }
  return undefined
}

export function useTransaction(id: string | null) {
  const queryClient = useQueryClient()
  return useQuery<Transaction>({
    queryKey: transactionKeys.detail(id ?? ''),
    queryFn: ({ signal }) => getTransaction(id!, { signal }).then((res) => res.data),
    enabled: id !== null,
    placeholderData: () => (id ? findInLists(queryClient, id) : undefined),
  })
}
