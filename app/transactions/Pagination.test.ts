import { pageItems } from './Pagination'

describe('pageItems', () => {
  it('matches the design on the first page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 'gap', 12])
  })

  it('shows the neighbours of the current page', () => {
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
  })

  it('fills a single missing page instead of showing a gap', () => {
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
  })

  it('handles the end and tiny totals', () => {
    expect(pageItems(12, 12)).toEqual([1, 'gap', 10, 11, 12])
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(2, 3)).toEqual([1, 2, 3])
  })
})
