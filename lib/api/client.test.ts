import { afterEach, vi } from 'vitest'
import { api, ApiError } from './client'

function mockFetch(status: number, body: unknown) {
  const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api client', () => {
  it('returns the body on success', async () => {
    mockFetch(200, { data: { id: 'txn_1' } })
    await expect(api.get('/transactions/txn_1')).resolves.toEqual({ data: { id: 'txn_1' } })
  })

  it('throws an ApiError with the server code and message on an error response', async () => {
    mockFetch(500, { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })

    const error = await api.get('/transactions').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong.' })
  })

  it('throws an ApiError when an error response is not JSON', async () => {
    mockFetch(502, '<html>Bad gateway</html>')
    await expect(api.get('/transactions')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' })
  })

  it('passes the abort signal through to fetch', async () => {
    const fetchSpy = mockFetch(200, { data: [] })
    const controller = new AbortController()

    await api.get('/transactions', { signal: controller.signal })
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/transactions',
      expect.objectContaining({ signal: controller.signal })
    )
  })
})
