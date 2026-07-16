import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Save" />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button label="Create" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button label="Delete" onClick={onClick} disabled />)
    const button = screen.getByRole('button', { name: /delete/i })

    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a start icon when provided', () => {
    render(
      <Button
        label="Login"
        startIcon={<span data-testid="start-icon">*</span>}
      />,
    )

    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })
})
