import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThreeDotsMenu from './ThreeDotsMenu'

describe('ThreeDotsMenu', () => {
  it('opens the menu and runs the selected action', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <ThreeDotsMenu
        ariaLabel="Contact actions"
        items={[
          { label: 'Edit Contact', onClick: onEdit },
          { label: 'Delete Contact', onClick: onDelete, danger: true },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /contact actions/i }))
    expect(screen.getByText('Edit Contact')).toBeInTheDocument()
    expect(screen.getByText('Delete Contact')).toBeInTheDocument()

    await user.click(screen.getByText('Edit Contact'))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onDelete).not.toHaveBeenCalled()
  })
})
