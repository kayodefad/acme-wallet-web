import {
  hasActiveFilters,
  parseFilters,
  parseSelectedId,
  toTransactionQuery,
  withPatch,
} from './search-params'

const params = (qs: string) => new URLSearchParams(qs)

describe('parseFilters', () => {
  it('reads search, filters and page from the URL', () => {
    expect(parseFilters(params('q=netflix&type=card_payment&status=failed&page=3'))).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
    })
  })

  it('falls back to defaults for missing or invalid values', () => {
    expect(parseFilters(params('type=reversed&status=REVERSED&page=-2'))).toEqual({
      q: '',
      type: null,
      status: null,
      page: 1,
    })
    expect(parseFilters(params('page=2.5')).page).toBe(1)
    expect(parseFilters(params('page=abc')).page).toBe(1)
  })
})

describe('parseSelectedId', () => {
  it('reads the open transaction', () => {
    expect(parseSelectedId(params('txn=txn_255s'))).toBe('txn_255s')
    expect(parseSelectedId(params('txn='))).toBeNull()
  })
})

describe('hasActiveFilters', () => {
  it('is false for the default view only', () => {
    expect(hasActiveFilters(parseFilters(params('page=4')))).toBe(false)
    expect(hasActiveFilters(parseFilters(params('q=ada')))).toBe(true)
    expect(hasActiveFilters(parseFilters(params('status=pending')))).toBe(true)
  })
})

describe('toTransactionQuery', () => {
  it('omits empty filters', () => {
    expect(toTransactionQuery(parseFilters(params('page=2')))).toEqual({
      page: 2,
      limit: 20,
      q: undefined,
      type: undefined,
      status: undefined,
    })
  })
})

describe('withPatch', () => {
  it('resets the page when a filter changes', () => {
    expect(withPatch(params('status=failed&page=4'), { type: 'deposit' })).toBe('?status=failed&type=deposit')
  })

  it('keeps filters when paging and leaves page 1 out of the URL', () => {
    expect(withPatch(params('q=ada'), { page: 2 })).toBe('?q=ada&page=2')
    expect(withPatch(params('q=ada&page=2'), { page: 1 })).toBe('?q=ada')
  })

  it('opens and closes details without touching the list state', () => {
    expect(withPatch(params('q=ada&page=2'), { txn: 'txn_1' })).toBe('?q=ada&page=2&txn=txn_1')
    expect(withPatch(params('q=ada&page=2&txn=txn_1'), { txn: null })).toBe('?q=ada&page=2')
  })

  it('preserves params it does not own, such as __scenario', () => {
    expect(withPatch(params('__scenario=slow'), { q: 'net' })).toBe('?__scenario=slow&q=net')
  })

  it('clears every filter', () => {
    expect(
      withPatch(params('q=ada&type=deposit&status=failed&page=3'), { q: '', type: null, status: null })
    ).toBe('')
  })
})
