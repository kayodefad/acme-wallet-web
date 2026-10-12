import { render, screen } from '@testing-library/react'
import { Input } from '../Input'
import { Select } from '../Select'

describe('Field labels', () => {
  it('labels an Input', () => {
    render(<Input label="Search" />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
  })

  it('labels a Select, even when the label is visually hidden', () => {
    render(
      <Select
        label="Status"
        hideLabel
        options={[{ value: '', label: 'All statuses' }]}
        value=""
        onValueChange={() => {}}
      />
    )
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()
  })
})
