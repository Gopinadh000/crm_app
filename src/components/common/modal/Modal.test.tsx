import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Create Contact">
        <p>Body</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Create Contact')).not.toBeInTheDocument()
  })

  it('renders title, body, and footer when open', () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        title="Create Contact"
        footer={<button type="button">Save</button>}
      >
        <p>Contact form</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create Contact')).toBeInTheDocument()
    expect(screen.getByText('Contact form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open onClose={onClose} title="Edit Contact">
        <p>Body</p>
      </Modal>,
    )

    await user.click(screen.getByRole('button', { name: /close modal$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Modal open onClose={onClose} title="Delete Contact">
        <p>Confirm delete</p>
      </Modal>,
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
