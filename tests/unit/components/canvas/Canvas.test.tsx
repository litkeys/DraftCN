import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store'
import { blockRegistry } from '@/lib/blocks/registry'
import { dragManager } from '@/lib/drag/manager'
import type { BlockTemplate, Block } from '@/types'

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

// Mock drag selectors
vi.mock('@/store/slices/drag', () => ({
  dragSelectors: {
    isDragging: (state: any) => state.isDragging,
    getDraggedItem: (state: any) => state.getDraggedItem,
    getDragSource: (state: any) => state.getDragSource,
    getDragPosition: (state: any) => state.getDragPosition,
    getDragOffset: (state: any) => state.getDragOffset,
  },
}))

// Mock DropPreview component
vi.mock('@/components/canvas/DropPreview', () => ({
  DropPreview: () => null,
}))

// Mock blocks selectors
vi.mock('@/store/slices/blocks', () => ({
  blocksSelectors: {
    getAllBlocks: (state: any) => state.blocks || [],
  },
}))

// Mock block registry
vi.mock('@/lib/blocks/registry', () => ({
  blockRegistry: {
    generateBlockInstance: vi.fn(),
    getTemplate: vi.fn(),
  },
}))

// Mock drag manager
vi.mock('@/lib/drag/manager', () => ({
  dragManager: {
    endDrag: vi.fn(),
    cancelDrag: vi.fn(),
  },
}))

describe('Canvas', () => {
  const mockClearDragState = vi.fn()
  const mockAddBlock = vi.fn()
  const mockGetHighestZIndex = vi.fn()

  const mockTemplate: BlockTemplate = {
    typeId: 'test-template',
    name: 'Test Template',
    category: 'Test',
    component: () => <div>Test Component</div>,
    defaultProps: {},
    defaultWidth: 200,
    defaultHeight: 100,
    dependencies: [],
    minimumWidth: 100,
    minimumHeight: 50,
  }

  const mockBlock: Block = {
    id: 'block-1',
    typeId: 'test-template',
    props: {},
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    z: 1,
    selected: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default store mock setup
    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const state = {
          isDragging: false,
          getDraggedItem: null,
          getDragSource: null,
          blocks: [],
          clearDragState: mockClearDragState,
          addBlock: mockAddBlock,
          getHighestZIndex: mockGetHighestZIndex,
        }
        return selector(state)
      }
      return null
    })

    // Default registry mock setup
    ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
    mockGetHighestZIndex.mockReturnValue(0)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render canvas element', () => {
      render(<Canvas />)
      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    it('should have proper styling', () => {
      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      expect(canvas.className).toContain('relative')
      expect(canvas.className).toContain('w-full')
      expect(canvas.className).toContain('h-full')
      expect(canvas.className).toContain('bg-slate-50')
      expect(canvas.className).toContain('overflow-auto')
    })

    it('should render existing blocks', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      expect(screen.getByTestId(`block-${mockBlock.id}`)).toBeInTheDocument()
    })

    it('should show drag indicator when dragging', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      const { container } = render(<Canvas />)
      const indicator = container.querySelector('.border-dashed')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('Drop Handling - Library Template', () => {
    it('should handle drop when dragging template from library', () => {
      const generatedBlock = { ...mockBlock, id: 'new-block-1' }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      // Mock getBoundingClientRect
      const mockRect = {
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

      // Simulate drop
      fireEvent.mouseUp(canvas, { clientX: 300, clientY: 200 })

      // Should generate block instance
      expect(blockRegistry.generateBlockInstance).toHaveBeenCalledWith(mockTemplate.typeId)
      
      // Should add block with correct position
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 300, // clientX - rect.left
          y: 200, // clientY - rect.top
          z: 1,   // highestZ + 1
        })
      )

      // Should end drag
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()
    })

    it('should calculate sequential z-index', () => {
      mockGetHighestZIndex.mockReturnValue(5)
      const generatedBlock = { ...mockBlock, id: 'new-block-1', z: 0 }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      const mockRect = {
        left: 0, top: 0, right: 1000, bottom: 800,
        width: 1000, height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          z: 6, // 5 + 1
        })
      )
    })

    it('should cancel drag if block generation fails', () => {
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(null)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      const mockRect = {
        left: 0, top: 0, right: 1000, bottom: 800,
        width: 1000, height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create block instance')
      )
      expect(dragManager.cancelDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()
      expect(mockAddBlock).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Drop Validation', () => {
    it('should not drop if cursor is outside canvas', () => {
      const generatedBlock = { ...mockBlock }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      // Mock rect so cursor is outside
      const mockRect = {
        left: 100,
        top: 100,
        right: 500,
        bottom: 500,
        width: 400,
        height: 400,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

      // Click outside canvas bounds
      fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 })

      expect(dragManager.cancelDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()
      expect(mockAddBlock).not.toHaveBeenCalled()
    })

    it('should not drop if not dragging', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      expect(mockAddBlock).not.toHaveBeenCalled()
      expect(dragManager.endDrag).not.toHaveBeenCalled()
    })

    it('should not drop if no dragged item', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: null,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      expect(mockAddBlock).not.toHaveBeenCalled()
    })
  })

  describe('Mouse Events', () => {
    it('should add drag-over class on mouse enter when dragging', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      fireEvent.mouseEnter(canvas)
      
      expect(canvas.classList.contains('drag-over')).toBe(true)
    })

    it('should remove drag-over class on mouse leave', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      fireEvent.mouseEnter(canvas)
      fireEvent.mouseLeave(canvas)
      
      expect(canvas.classList.contains('drag-over')).toBe(false)
    })
  })

  describe('Block Rendering', () => {
    it('should position blocks correctly', () => {
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)
      
      expect(blockElement.style.left).toBe(`${mockBlock.x}px`)
      expect(blockElement.style.top).toBe(`${mockBlock.y}px`)
      expect(blockElement.style.width).toBe(`${mockBlock.width}px`)
      expect(blockElement.style.height).toBe(`${mockBlock.height}px`)
      expect(blockElement.style.zIndex).toBe(`${mockBlock.z}`)
    })

    it('should not render blocks without templates', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(null)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      expect(screen.queryByTestId(`block-${mockBlock.id}`)).not.toBeInTheDocument()
    })
  })
})