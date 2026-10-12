import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('is a keyboard-operable button', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Try again</Button>)

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not submit forms by default', () => {
    render(<Button>Clear filters</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Convert
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
