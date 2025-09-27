import { render, screen } from '@testing-library/react'
import AdminLayout from '@/components/layout/roles/AdminLayout'

describe('AdminLayout', () => {
  it('renders children content', () => {
    render(
      <AdminLayout>
        <div data-testid="admin-content">Admin Dashboard Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })

  it('applies correct background styling', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    )
    
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen')
    expect(mainDiv).toHaveClass('bg-gradient-to-br')
    expect(mainDiv).toHaveClass('from-slate-50')
    expect(mainDiv).toHaveClass('via-white')
    expect(mainDiv).toHaveClass('to-blue-50')
  })
})
