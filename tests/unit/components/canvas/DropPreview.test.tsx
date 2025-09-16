import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DropPreview } from '@/components/canvas/DropPreview'
import { useAppStore } from '@/store'
import type { BlockTemplate } from '@/types/template'

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

// Mock drag selectors
vi.mock('@/store/slices/drag', () => ({
  dragSelectors: {
    isDragging: (state: any) => state.isDragging,
    getDraggedItem: (state: any) => state.getDraggedItem,
    getDragPosition: (state: any) => state.getDragPosition,
    getDragOffset: (state: any) => state.getDragOffset,
    getDragSource: (state: any) => state.getDragSource,
  },
}))

describe('DropPreview', () => {
  const mockTemplate: BlockTemplate = {
    typeId: 'test-template',
    name: 'Test Template',
    category: 'Test Category',
    component: () => <div>Test Component</div>,
    defaultProps: { text: 'Hello' },
    defaultWidth: 300,
    defaultHeight: 150,
    dependencies: [],
    minimumWidth: 100,
    minimumHeight: 50,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility', () => {
    it('should not render when not dragging', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: false,
          getDraggedItem: null,
          getDragPosition: { x: 0, y: 0 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: null,
        }
        return selector(state)
      })

      const { container } = render(<DropPreview />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when dragging but no item', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: null,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      const { container } = render(<DropPreview />)
      expect(container.firstChild).toBeNull()
    })

    it('should render when actively dragging an item from library', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 10, y: 10 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      expect(screen.getByTestId('drop-preview')).toBeInTheDocument()
    })

    it('should NOT render when dragging from canvas (Task 2 requirement)', () => {
      const mockBlock = {
        id: 'block-1',
        typeId: 'test-block',
        width: 400,
        height: 200,
        props: { content: 'Block content' },
      }

      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockBlock,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 10, y: 10 },
          getDragSource: 'canvas', // Dragging from canvas
        }
        return selector(state)
      })

      const { container } = render(<DropPreview />)
      expect(container.firstChild).toBeNull() // Should not render preview for canvas drags
    })
  })

  describe('Library Template Preview', () => {
    it('should render template component when dragging from library', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 200, y: 150 },
          getDragOffset: { x: 20, y: 15 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should use template default dimensions', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 200, y: 150 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.width).toBe('300px')
      expect(preview.style.height).toBe('150px')
    })

    it('should render fallback when template has no component', () => {
      const templateWithoutComponent = { ...mockTemplate, component: null }
      
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: templateWithoutComponent,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      expect(screen.getByText('Test Template')).toBeInTheDocument()
      expect(screen.getByText('Test Category')).toBeInTheDocument()
    })

    it('should use fallback dimensions when not specified', () => {
      const templateWithoutDimensions = { 
        ...mockTemplate, 
        defaultWidth: undefined, 
        defaultHeight: undefined 
      }
      
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: templateWithoutDimensions,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.width).toBe('200px') // Fallback width
      expect(preview.style.height).toBe('100px') // Fallback height
    })
  })


  describe('Positioning', () => {
    it('should position preview at cursor minus offset', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 300, y: 200 },
          getDragOffset: { x: 50, y: 25 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.left).toBe('250px') // 300 - 50
      expect(preview.style.top).toBe('175px')  // 200 - 25
    })

    it('should handle zero offset', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 150 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.left).toBe('100px')
      expect(preview.style.top).toBe('150px')
    })

    it('should handle negative positions', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 30, y: 20 },
          getDragOffset: { x: 50, y: 40 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.left).toBe('-20px') // 30 - 50
      expect(preview.style.top).toBe('-20px')  // 20 - 40
    })
  })

  describe('Styling', () => {
    it('should have semi-transparent styling', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.opacity).toBe('0.7')
    })

    it('should have pointer-events none to not interfere with drop', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.pointerEvents).toBe('none')
    })

    it('should have high z-index to appear above other elements', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.zIndex).toBe('9999')
    })

    it('should have fixed positioning', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const preview = screen.getByTestId('drop-preview')
      expect(preview.style.position).toBe('fixed')
    })

    it('should have border and shadow styling', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        const state = {
          isDragging: true,
          getDraggedItem: mockTemplate,
          getDragPosition: { x: 100, y: 100 },
          getDragOffset: { x: 0, y: 0 },
          getDragSource: 'library',
        }
        return selector(state)
      })

      render(<DropPreview />)
      const innerDiv = screen.getByTestId('drop-preview').firstChild as HTMLElement
      expect(innerDiv.className).toContain('border-2')
      expect(innerDiv.className).toContain('border-dashed')
      expect(innerDiv.className).toContain('border-primary/50')
      expect(innerDiv.className).toContain('rounded-lg')
      expect(innerDiv.className).toContain('shadow-2xl')
    })
  })
})