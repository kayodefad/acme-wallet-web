import { useQuery } from '@tanstack/react-query'
import { getMe } from './endpoints'

export const meQueryKey = ['me'] as const

/** The signed-in user and wallets. One cached request shared by the navbar, dashboard and convert page. */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: ({ signal }) => getMe({ signal }).then((res) => res.data),
  })
}
