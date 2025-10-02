import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateCard } from '@/components/blocks/TemplateCard'
import type { BlockTemplate } from '@/types/template'
import { useDrag } from '@/hooks/useDrag'

// Mock useDrag hook
vi.mock('@/hooks/useDrag', () => ({
  useDrag: vi.fn(),
}))

describe('TemplateCard', () => {
  const mockHandlePointerDown = vi.fn()

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Setup useDrag mock
    ;(useDrag as any).mockReturnValue({
      isDragging: false,
      handlePointerDown: mockHandlePointerDown,
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

    it('should use useDrag hook with correct parameters', () => {
      render(<TemplateCard template={mockTemplate} />)
      
      // Should call useDrag with correct parameters
      expect(useDrag).toHaveBeenCalledWith({
        sourceType: 'library',
        item: mockTemplate,
      })
    })

    it('should call handlePointerDown on pointer down', () => {
      const { container } = render(<TemplateCard template={mockTemplate} />)
      const card = container.firstChild as HTMLElement

      fireEvent.pointerDown(card)

      // Should call the handlePointerDown from useDrag hook
      expect(mockHandlePointerDown).toHaveBeenCalled()
    })






  })
})