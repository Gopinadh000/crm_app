import { render, screen } from '@testing-library/react'
import PageTitle from './PageTitle'

describe('PageTitle', () => {
  it('renders the title text', () => {
    render(<PageTitle title="Contacts" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contacts' }),
    ).toBeInTheDocument()
  })

  it('renders children actions when provided', () => {
    render(
      <PageTitle title="Contacts">
        <button type="button">Create</button>
      </PageTitle>,
    )

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('does not render an actions wrapper when there are no children', () => {
    const { container } = render(<PageTitle title="Dashboard" />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })
})
