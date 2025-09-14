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

// Mock useKeyboard hook
vi.mock('@/hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
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
  const mockSelectBlock = vi.fn()
  const mockClearSelection = vi.fn()

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
          getDragOffset: { x: 0, y: 0 },
          blocks: [],
          clearDragState: mockClearDragState,
          addBlock: mockAddBlock,
          getHighestZIndex: mockGetHighestZIndex,
          selectBlock: mockSelectBlock,
          clearSelection: mockClearSelection,
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
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      expect(screen.queryByTestId(`block-${mockBlock.id}`)).not.toBeInTheDocument()
    })
  })

  describe('Offset-Aware Drop Positioning', () => {
    it('should apply drag offset when dropping from library', () => {
      const generatedBlock = { ...mockBlock }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)
      mockGetHighestZIndex.mockReturnValue(0)

      // Set up drag state with offset
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            getDragOffset: { x: 30, y: 20 }, // User clicked 30px from left, 20px from top of template
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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

      // Drop at cursor position (400, 300)
      fireEvent.mouseUp(canvas, { clientX: 400, clientY: 300 })
      
      // Should subtract offset from cursor position
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 370, // 400 - 30
          y: 280, // 300 - 20
        })
      )
    })

    it('should handle zero offset gracefully', () => {
      const generatedBlock = { ...mockBlock }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)
      mockGetHighestZIndex.mockReturnValue(0)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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

      fireEvent.mouseUp(canvas, { clientX: 400, clientY: 300 })
      
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 400, // No offset applied
          y: 300, // No offset applied
        })
      )
    })

    it('should handle undefined offset safely', () => {
      const generatedBlock = { ...mockBlock }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)
      mockGetHighestZIndex.mockReturnValue(0)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            getDragOffset: undefined, // Simulating undefined offset
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
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

      fireEvent.mouseUp(canvas, { clientX: 400, clientY: 300 })
      
      // Should treat undefined as zero offset
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 400,
          y: 300,
        })
      )
    })

    it('should correctly position block with canvas offset and drag offset', () => {
      const generatedBlock = { ...mockBlock }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(generatedBlock)
      mockGetHighestZIndex.mockReturnValue(0)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            getDragOffset: { x: 50, y: 25 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      
      // Canvas is offset from viewport
      const mockRect = {
        left: 100, top: 50, right: 1100, bottom: 850,
        width: 1000, height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

      // Drop at absolute position (500, 400)
      fireEvent.mouseUp(canvas, { clientX: 500, clientY: 400 })
      
      // Should calculate: (clientX - canvas.left) - offset.x
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 350, // (500 - 100) - 50
          y: 325, // (400 - 50) - 25
        })
      )
    })
  })

  describe('Block Selection', () => {
    it('should call selectBlock when clicking on a block', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.click(blockElement)

      expect(mockSelectBlock).toHaveBeenCalledWith(mockBlock.id)
    })

    it('should apply selected styling when block is selected', () => {
      const selectedBlock = { ...mockBlock, selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [selectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      expect(blockElement).toHaveClass('border-blue-500')
      expect(blockElement).not.toHaveClass('border-transparent')
    })

    it('should apply hover styling when block is not selected', () => {
      const unselectedBlock = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [unselectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      expect(blockElement).toHaveClass('border-transparent')
      expect(blockElement).toHaveClass('hover:border-blue-500')
      expect(blockElement).not.toHaveClass('border-blue-500')
    })

    it('should add data-selected attribute based on selection state', () => {
      const selectedBlock = { ...mockBlock, selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [selectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      expect(blockElement).toHaveAttribute('data-selected', 'true')
    })

    it('should stop propagation when clicking on block', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      const clickEvent = new MouseEvent('click', { bubbles: true })
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')

      blockElement.dispatchEvent(clickEvent)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should render blocks with cursor pointer style', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      expect(blockElement).toHaveClass('cursor-pointer')
    })
  })

  describe('Canvas Click Deselection', () => {
    it('should call clearSelection when clicking on empty canvas area', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.click(canvas)

      expect(mockClearSelection).toHaveBeenCalled()
    })

    it('should only clear selection if clicking canvas itself (not children)', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      // Click on block - should NOT clear selection
      fireEvent.click(blockElement)
      expect(mockClearSelection).not.toHaveBeenCalled()
      expect(mockSelectBlock).toHaveBeenCalledWith(mockBlock.id)
    })

    it('should check event.target === event.currentTarget', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Create a click event where target !== currentTarget (simulating bubbled event)
      const event = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(event, 'target', { value: document.createElement('div'), enumerable: true })
      Object.defineProperty(event, 'currentTarget', { value: canvas, enumerable: true })

      canvas.dispatchEvent(event)

      expect(mockClearSelection).not.toHaveBeenCalled()
    })

    it('should not interfere with block click events due to stopPropagation', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      // Reset mocks
      mockSelectBlock.mockClear()
      mockClearSelection.mockClear()

      // Click on block
      fireEvent.click(blockElement)

      // Should call selectBlock but NOT clearSelection
      expect(mockSelectBlock).toHaveBeenCalledWith(mockBlock.id)
      expect(mockClearSelection).not.toHaveBeenCalled()

      // Now click on canvas
      fireEvent.click(canvas)

      // Should call clearSelection
      expect(mockClearSelection).toHaveBeenCalled()
    })

    it('should clear selection when clicking on canvas with selected blocks', () => {
      const selectedBlock = { ...mockBlock, selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [selectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Create a proper click event on canvas itself
      const canvasRect = canvas.getBoundingClientRect()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        clientX: canvasRect.left + 10,
        clientY: canvasRect.top + 10,
      })
      Object.defineProperty(clickEvent, 'target', { value: canvas, enumerable: true })
      Object.defineProperty(clickEvent, 'currentTarget', { value: canvas, enumerable: true })

      canvas.dispatchEvent(clickEvent)

      expect(mockClearSelection).toHaveBeenCalled()
    })
  })

  describe('Keyboard Event Handling', () => {
    it('should initialize useKeyboard hook', async () => {
      const { useKeyboard } = await import('@/hooks/useKeyboard')

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)

      expect(useKeyboard).toHaveBeenCalled()
    })
  })
})