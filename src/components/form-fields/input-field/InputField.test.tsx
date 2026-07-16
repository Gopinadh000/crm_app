import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputField from './InputField'

describe('InputField', () => {
  it('renders label and placeholder', () => {
    render(
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email"
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('shows a required marker when required', () => {
    render(
      <InputField
        required
        name="firstName"
        label="First Name"
        type="text"
        placeholder="Enter first name"
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email"
        value=""
        onChange={onChange}
      />,
    )

    await user.type(screen.getByLabelText(/email/i), 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows an error message when provided', () => {
    render(
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="Enter email"
        value=""
        error="Email is required"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('toggles password visibility with the eye button', async () => {
    const user = userEvent.setup()

    render(
      <InputField
        name="password"
        label="Password"
        type="password"
        placeholder="Enter password"
        value="secret"
        onChange={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
