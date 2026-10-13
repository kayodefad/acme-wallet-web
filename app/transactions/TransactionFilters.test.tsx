import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { TransactionFilters } from './TransactionFilters'
import type { TransactionFilters as Filters } from './search-params'

const empty: Filters = { q: '', type: null, status: null, page: 1 }

function setup(initial: Filters = empty) {
  const onChange = vi.fn()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const view = render(<TransactionFilters filters={initial} onChange={onChange} />)
  /** The URL changed: the page re-renders the filters with values parsed from it. */
  const urlChanged = (filters: Filters) =>
    view.rerender(<TransactionFilters filters={filters} onChange={onChange} />)
  const searchbox = () => screen.getByRole('searchbox', { name: 'Search' })
  return { onChange, user, urlChanged, searchbox }
}

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TransactionFilters search', () => {
  it('commits once after the debounce, pushing when a search starts', async () => {
    const { onChange, user, searchbox } = setup()
    await user.type(searchbox(), 'ada')
    expect(onChange).not.toHaveBeenCalled()

    await advance(300)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ q: 'ada' }, 'push')
  })

  it('replaces history while refining an existing search', async () => {
    const { onChange, user, searchbox } = setup({ ...empty, q: 'ada' })
    await user.type(searchbox(), 'm')
    await advance(300)
    expect(onChange).toHaveBeenCalledWith({ q: 'adam' }, 'replace')
  })

  it('flushes on Enter', async () => {
    const { onChange, user, searchbox } = setup()
    await user.type(searchbox(), 'ada{Enter}')
    expect(onChange).toHaveBeenCalledWith({ q: 'ada' }, 'push')
  })

  it('keeps newer typing when the URL echoes the search it just sent', async () => {
    const { user, urlChanged, searchbox } = setup()
    await user.type(searchbox(), 'ada')
    await advance(300)
    await user.type(searchbox(), 'm') // typed while the navigation was in flight

    urlChanged({ ...empty, q: 'ada' })
    expect(searchbox()).toHaveValue('adam')
  })

  it('a URL change from elsewhere (e.g. Back) wins and cancels the pending search', async () => {
    const { onChange, user, urlChanged, searchbox } = setup({ ...empty, q: 'ada' })
    await user.clear(searchbox())
    await user.type(searchbox(), 'kw')

    urlChanged({ ...empty, page: 2 }) // Back, before the debounce fired
    await advance(300)

    expect(onChange).not.toHaveBeenCalled()
    expect(searchbox()).toHaveValue('')
  })

  it('Clear filters cancels a pending search and resets everything', async () => {
    const { onChange, user, searchbox } = setup({ ...empty, status: 'failed' })
    await user.type(searchbox(), 'kw')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await advance(300)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ q: '', type: null, status: null }, 'push')
    expect(searchbox()).toHaveValue('')
  })

  it('a filter change carries pending search text with it', async () => {
    const { onChange, user, searchbox } = setup()
    await user.type(searchbox(), 'ada')
    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(screen.getByRole('option', { name: 'Failed' }))
    await advance(300)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ status: 'failed', q: 'ada' }, 'push')
  })
})
