import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui/Card'

describe('Card Component', () => {
  it('renders with children content', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content goes here</p>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content goes here')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-card">Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('custom-card')
  })

  it('renders with default styling', () => {
    render(<Card>Content</Card>)
    const cardElement = screen.getByText('Content')
    expect(cardElement).toHaveClass('bg-white')
    expect(cardElement).toHaveClass('rounded-xl')
    expect(cardElement).toHaveClass('shadow-sm')
  })
})
