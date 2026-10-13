import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Select } from './Select'

const OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'successful', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function renderSelect(value = '', onValueChange = vi.fn()) {
  render(<Select label="Status" options={OPTIONS} value={value} onValueChange={onValueChange} />)
  return onValueChange
}

describe('Select', () => {
  it('is a labelled combobox showing the selected option', () => {
    renderSelect('pending')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Pending')
  })

  it('shows the "all" option for an empty value', () => {
    renderSelect('')
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('All statuses')
  })

  it('lists the options and reports the chosen value', async () => {
    const onValueChange = renderSelect('')
    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))

    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'All statuses',
      'Successful',
      'Pending',
      'Failed',
    ])
    await userEvent.click(screen.getByRole('option', { name: 'Failed' }))
    expect(onValueChange).toHaveBeenCalledWith('failed')
  })

  it('maps the "all" option back to an empty string', async () => {
    const onValueChange = renderSelect('failed')
    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(screen.getByRole('option', { name: 'All statuses' }))
    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('works from the keyboard', async () => {
    const onValueChange = renderSelect('')
    screen.getByRole('combobox', { name: 'Status' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('successful')
  })
})
