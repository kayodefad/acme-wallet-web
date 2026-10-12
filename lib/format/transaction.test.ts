import { describeTransaction, initialsOf, isCredit } from './transaction'
import { formatDayLabel } from './date'

describe('initialsOf', () => {
  it('takes the first letter of the first two words, splitting on hyphens', () => {
    expect(initialsOf('Ada Okafor')).toBe('AO')
    expect(initialsOf('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initialsOf('kwame')).toBe('K')
  })
})

describe('isCredit', () => {
  it('treats money coming in, including conversions, as credit', () => {
    expect(isCredit({ type: 'deposit' })).toBe(true)
    expect(isCredit({ type: 'transfer_in' })).toBe(true)
    expect(isCredit({ type: 'conversion' })).toBe(true)
    expect(isCredit({ type: 'card_payment' })).toBe(false)
    expect(isCredit({ type: 'transfer_out' })).toBe(false)
  })
})

describe('describeTransaction', () => {
  it('names the counterparty for transfers and falls back to the narration', () => {
    expect(describeTransaction({ type: 'transfer_out', counterparty: 'Kwame Mensah', narration: 'x' })).toBe(
      'Transfer out to Kwame Mensah'
    )
    expect(describeTransaction({ type: 'transfer_in', counterparty: 'Ada Okafor', narration: 'x' })).toBe(
      'Transfer in from Ada Okafor'
    )
    expect(
      describeTransaction({ type: 'card_payment', counterparty: null, narration: 'Card payment - Netflix' })
    ).toBe('Card payment - Netflix')
  })
})

describe('formatDayLabel', () => {
  const now = new Date(2026, 9, 12, 10, 0)

  it('labels today and yesterday in local time', () => {
    expect(formatDayLabel(new Date(2026, 9, 12, 0, 5).toISOString(), now)).toBe('Today')
    expect(formatDayLabel(new Date(2026, 9, 11, 23, 59).toISOString(), now)).toBe('Yesterday')
  })

  it('uses the full date for older days', () => {
    expect(formatDayLabel(new Date(2026, 9, 5, 12, 0).toISOString(), now)).toBe('Mon, 5 Oct 2026')
  })
})
