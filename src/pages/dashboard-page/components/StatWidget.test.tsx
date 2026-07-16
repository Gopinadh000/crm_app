import { render, screen } from '@testing-library/react'
import StatWidget from './StatWidget'

describe('StatWidget', () => {
  it('renders title, value, subtitle, and icon', () => {
    render(
      <StatWidget
        title="Total Users"
        value={12}
        subtitle="Registered accounts in the system"
        icon={<span data-testid="widget-icon">U</span>}
        accentClass="bg-blue-50"
        iconClass="text-blue-600"
      />,
    )

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(
      screen.getByText('Registered accounts in the system'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('widget-icon')).toBeInTheDocument()
  })
})
