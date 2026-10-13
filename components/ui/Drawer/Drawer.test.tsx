import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { vi } from 'vitest'
import { Drawer } from './Drawer'

function renderDrawer(onClose = vi.fn()) {
  render(
    <Drawer open title="Transaction details" onClose={onClose}>
      <button type="button">Copy reference</button>
    </Drawer>
  )
  return onClose
}

describe('Drawer', () => {
  it('is a labelled modal dialog that takes focus', () => {
    renderDrawer()
    const dialog = screen.getByRole('dialog', { name: 'Transaction details' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveFocus()
  })

  it('closes on Escape and from the close button', async () => {
    const onClose = renderDrawer()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not close when clicking inside the panel', async () => {
    const onClose = renderDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Copy reference' }))
    await userEvent.click(screen.getByRole('heading', { name: 'Transaction details' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps Tab inside the panel', async () => {
    renderDrawer()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Copy reference' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('returns focus to the element that opened it', async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Drawer open={open} title="Details" onClose={() => setOpen(false)}>
            body
          </Drawer>
        </>
      )
    }
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()
  })

  it('falls back to returnFocusRef when nothing had focus before opening', async () => {
    function Harness() {
      const [open, setOpen] = useState(true) // open on load, like a shared link
      const headingRef = useRef<HTMLHeadingElement>(null)
      return (
        <>
          <h1 ref={headingRef} tabIndex={-1}>
            Transactions
          </h1>
          <Drawer open={open} title="Details" onClose={() => setOpen(false)} returnFocusRef={headingRef}>
            body
          </Drawer>
        </>
      )
    }
    render(<Harness />)
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('heading', { name: 'Transactions' })).toHaveFocus()
  })
})
