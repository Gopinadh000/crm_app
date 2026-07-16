import { render, screen } from '@testing-library/react'
import ContactAvatar from './ContactAvatar'

describe('ContactAvatar', () => {
  it('renders the first initial when no image is provided', () => {
    render(<ContactAvatar firstName="Wayne" lastName="Fletcher" />)
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('renders an image when an image url is provided', () => {
    render(
      <ContactAvatar
        firstName="Wayne"
        lastName="Fletcher"
        image="data:image/png;base64,abc"
      />,
    )

    const image = screen.getByRole('img', { name: /wayne fletcher/i })
    expect(image).toHaveAttribute('src', 'data:image/png;base64,abc')
  })
})
