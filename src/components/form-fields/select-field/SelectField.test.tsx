import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SelectField from './SelectField'

describe('SelectField', () => {
  const options = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'User', value: 'USER' },
  ]

  it('renders the label and placeholder', () => {
    render(
      <SelectField
        name="role"
        label="Role"
        placeholder="Select role"
        value=""
        options={options}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Select role')).toBeInTheDocument()
  })

  it('shows an error helper when provided', () => {
    render(
      <SelectField
        name="role"
        label="Role"
        value=""
        options={options}
        error="Role is required"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Role is required')).toBeInTheDocument()
  })

  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SelectField
        name="role"
        label="Role"
        value=""
        options={options}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'User' }))

    expect(onChange).toHaveBeenCalled()
  })
})
