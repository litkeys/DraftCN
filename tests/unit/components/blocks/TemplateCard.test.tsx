import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateCard } from '@/components/blocks/TemplateCard'
import type { BlockTemplate } from '@/types/template'
import { dragManager } from '@/lib/drag/manager'
import { useAppStore } from '@/store'

// Mock the drag manager
vi.mock('@/lib/drag/manager', () => ({
  dragManager: {
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    isDragging: vi.fn(() => false),
  },
}))

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

describe('TemplateCard', () => {
  const mockSetDragState = vi.fn()

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Setup store mock
    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({ setDragState: mockSetDragState })
      }
      return mockSetDragState
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mockTemplate: BlockTemplate = {
    typeId: 'test-template',
    name: 'Test Template',
    category: 'Test',
    thumbnail: 'data:image/png;base64,test',
    component: () => null,
    dependencies: [],
    defaultProps: {},
    defaultWidth: 1200,
    defaultHeight: 400,
    minimumWidth: 600,
    minimumHeight: 200,
  }

  describe('Rendering', () => {
    it('should display template name', () => {
      render(<TemplateCard template={mockTemplate} />)
      expect(screen.getByText('Test Template')).toBeInTheDocument()
    })

    it('should display template thumbnail when available', () => {
      render(<TemplateCard template={mockTemplate} />)
      const img = screen.getByAltText('Test Template') as HTMLImageElement
      expect(img).toBeInTheDocument()
      expect(img.src).toBe('data:image/png;base64,test')
    })

    it('should display placeholder icon when thumbnail is not available', () => {
      const templateWithoutThumbnail = { ...mockTemplate, thumbnail: undefined }
      render(<TemplateCard template={templateWithoutThumbnail} />)
      
      const placeholder = document.querySelector('.bg-muted')
      expect(placeholder).toBeInTheDocument()
      expect(placeholder).toHaveClass('bg-muted')
    })

    it('should set data-template-id attribute for drag identification', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.querySelector('[data-template-id]')
      expect(card).toHaveAttribute('data-template-id', 'test-template')
    })
  })

  describe('Hover States', () => {
    it('should have cursor-grab class for draggability indication', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('cursor-grab')
    })

    it('should have hover effects applied', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('hover:shadow-md')
      expect(card.className).toContain('hover:scale-[1.02]')
      expect(card.className).toContain('transition-all')
    })
  })

  describe('Error Handling', () => {
    it('should display placeholder when image fails to load', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      
      const img = screen.getByAltText('Test Template') as HTMLImageElement
      fireEvent.error(img)
      
      // After error, placeholder should be shown
      const placeholder = container.querySelector('.bg-muted')
      expect(placeholder).toBeInTheDocument()
      expect(screen.queryByAltText('Test Template')).not.toBeInTheDocument()
    })

    it('should handle templates with empty thumbnail gracefully', () => {
      const { container } = render(<TemplateCard template={{ ...mockTemplate, thumbnail: '' }} />)
      
      const placeholder = container.querySelector('.bg-muted')
      expect(placeholder).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have proper card styling', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('border')
      expect(card.className).toContain('rounded-lg')
      expect(card.className).toContain('p-3')
    })

    it('should style thumbnail with proper dimensions', () => {
      render(<TemplateCard template={mockTemplate} />)
      const img = screen.getByAltText('Test Template') as HTMLImageElement
      expect(img.className).toContain('w-full')
      expect(img.className).toContain('h-24')
      expect(img.className).toContain('object-cover')
      expect(img.className).toContain('rounded')
    })

    it('should style template name appropriately', () => {
      render(<TemplateCard template={mockTemplate} />)
      const nameElement = screen.getByText('Test Template')
      expect(nameElement.className).toContain('text-sm')
      expect(nameElement.className).toContain('font-medium')
    })
  })

  describe('Drag Functionality', () => {
    it('should have draggable attribute set to false to prevent browser drag', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('draggable', 'false')
      
      const img = screen.queryByAltText('Test Template') as HTMLImageElement
      if (img) {
        expect(img).toHaveAttribute('draggable', 'false')
      }
    })

    it('should initiate drag on mousedown', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
        cancelable: true,
      })
      
      fireEvent(card, mouseDownEvent)
      
      // Should call dragManager.startDrag with correct parameters
      expect(dragManager.startDrag).toHaveBeenCalledWith(
        'library',
        mockTemplate,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      )
    })

    it('should update store state when drag starts', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      fireEvent.mouseDown(card, { clientX: 100, clientY: 200 })
      
      // Should update store with initial drag state
      expect(mockSetDragState).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          sourceType: 'library',
          draggedItem: mockTemplate,
          position: { x: 100, y: 200 },
        })
      )
    })

    it('should prevent default on mousedown to avoid text selection', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
        cancelable: true,
      })
      
      const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault')
      
      fireEvent(card, mouseDownEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should calculate offset from click position', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 50,
        top: 100,
        right: 250,
        bottom: 200,
        width: 200,
        height: 100,
        x: 50,
        y: 100,
      }
      vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)
      
      fireEvent.mouseDown(card, { clientX: 150, clientY: 150 })
      
      // Offset should be click position relative to element
      expect(dragManager.startDrag).toHaveBeenCalledWith(
        'library',
        mockTemplate,
        {
          x: 100, // 150 - 50
          y: 50,  // 150 - 100
        }
      )
    })

    it('should set up global mouse event listeners on drag start', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      fireEvent.mouseDown(card)
      
      // Should add mousemove and mouseup listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
    })

    it('should clean up listeners on mouseup', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      fireEvent.mouseDown(card)
      
      // Simulate mouseup
      fireEvent.mouseUp(document)
      
      // Should remove mousemove and mouseup listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })

    it('should end drag and clear state on mouseup when dragging', () => {
      ;(dragManager.isDragging as any).mockReturnValue(true)
      
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement
      
      fireEvent.mouseDown(card)
      mockSetDragState.mockClear()
      
      // Simulate mouseup
      fireEvent.mouseUp(document)
      
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockSetDragState).toHaveBeenCalledWith({
        isActive: false,
        sourceType: null,
        draggedItem: null,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
      })
    })
  })
})