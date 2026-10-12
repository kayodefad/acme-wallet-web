import { render } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('formats minor units with two decimals and the currency symbol', () => {
    const { container } = render(<Money amount={150050} currency="NGN" />)
    expect(container).toHaveTextContent('₦1,500.50')
  })

  it('keeps trailing zeros and large amounts exact', () => {
    const { container } = render(<Money amount={249999999999} currency="NGN" />)
    expect(container).toHaveTextContent('₦2,499,999,999.99')
  })

  it('prefixes credits with + and debits with a minus sign', () => {
    const { container: credit } = render(<Money amount={2500000} currency="NGN" sign="credit" />)
    const { container: debit } = render(<Money amount={1549} currency="USD" sign="debit" />)
    expect(credit).toHaveTextContent('+₦25,000.00')
    expect(debit).toHaveTextContent('−$15.49')
  })
})
