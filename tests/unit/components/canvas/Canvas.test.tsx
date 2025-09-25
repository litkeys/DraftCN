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
    startDrag: vi.fn(),
    isDragging: vi.fn(),
    getDragState: vi.fn(),
  },
}))

describe('Canvas', () => {
  const mockClearDragState = vi.fn()
  const mockAddBlock = vi.fn()
  const mockGetHighestZIndex = vi.fn()
  const mockSelectBlock = vi.fn()
  const mockClearSelection = vi.fn()
  const mockUpdateBlock = vi.fn()
  const mockSetDragState = vi.fn()
  const mockBlurSearchInput = vi.fn()

  const mockTemplate: BlockTemplate = {
    typeId: 'test-template',
    name: 'Test Template',
    category: 'Test',
    thumbnail: '/thumbnails/test.svg',
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

    // Reset dragManager mocks
    ;(dragManager.isDragging as any).mockReturnValue(false)

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
          updateBlock: mockUpdateBlock,
          setDragState: mockSetDragState,
          zoom: 100,
          panX: 0,
          panY: 0,
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
    it('should render container and canvas elements', () => {
      render(<Canvas />)
      expect(screen.getByTestId('canvas-container')).toBeInTheDocument()
      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    it('should render canvas nested within container', () => {
      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')
      const canvas = screen.getByTestId('canvas')
      expect(container).toContainElement(canvas)
    })

    it('should have proper container styling', () => {
      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')
      expect(container.className).toContain('w-full')
      expect(container.className).toContain('h-full')
      expect(container.className).toContain('bg-gray-100')
      expect(container.className).toContain('overflow-y-auto')
      expect(container.className).toContain('overflow-x-hidden')
      expect(container.className).toContain('p-8')
    })

    it('should have proper canvas styling', () => {
      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      expect(canvas.className).toContain('relative')
      expect(canvas.className).toContain('bg-white')
      expect(canvas.className).toContain('shadow-md')
      expect(canvas.className).toContain('outline')
      expect(canvas.className).toContain('outline-1')
      expect(canvas.className).toContain('outline-gray-200')
      expect(canvas.className).toContain('mx-auto')
      // Width is now set via style attribute, not Tailwind class
      expect(canvas).toHaveStyle({ width: '960px' }) // 1200 * 0.8 (default zoom 100% = 0.8 scale)
    })

    it('should set canvas width based on zoom level', () => {
      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      // At default zoom 100%, actual scale is 0.8, so width is 1200 * 0.8 = 960px
      expect(canvas).toHaveStyle({ width: '960px' })
    })

    it('should set canvas minimum height based on zoom level', () => {
      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      // At default zoom 100%, actual scale is 0.8, so height is 1200 * 0.8 = 960px
      expect(canvas).toHaveStyle({ minHeight: '960px' })
    })

    it('should horizontally center canvas with mx-auto', () => {
      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      expect(canvas).toHaveClass('mx-auto')
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
            zoom: 100,
            panX: 0,
            panY: 0,
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
            zoom: 100,
            panX: 0,
            panY: 0,
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
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(
        generatedBlock
      )
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'library',
        draggedItem: mockTemplate,
        isActive: true,
      })
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
            zoom: 100, // Default zoom
            panX: 0, // No pan
            panY: 0, // No pan
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
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        mockRect as DOMRect
      )

      // Simulate drop
      fireEvent.mouseUp(canvas, { clientX: 300, clientY: 200 })

      // Should generate block instance
      expect(blockRegistry.generateBlockInstance).toHaveBeenCalledWith(
        mockTemplate.typeId
      )

      // Should add block with correct position after coordinate transformation
      // At zoom 100%, actualScale = 0.8, so screenToWorld transforms: worldX = screenX / 0.8
      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 375, // (300 / 0.8) = 375 (world coordinates)
          y: 250, // (200 / 0.8) = 250 (world coordinates)
          z: 1, // highestZ + 1
        })
      )

      // Should end drag
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()
    })

    it('should calculate sequential z-index', () => {
      mockGetHighestZIndex.mockReturnValue(5)
      const generatedBlock = { ...mockBlock, id: 'new-block-1', z: 0 }
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(
        generatedBlock
      )
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'library',
        draggedItem: mockTemplate,
        isActive: true,
      })
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
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      const mockRect = {
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        mockRect as DOMRect
      )

      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      expect(mockAddBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          z: 6, // 5 + 1
        })
      )
    })

    it('should cancel drag if block generation fails', () => {
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(null)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'library',
        draggedItem: mockTemplate,
        isActive: true,
      })
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
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      const mockRect = {
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        mockRect as DOMRect
      )

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
      ;(blockRegistry.generateBlockInstance as any).mockReturnValue(
        generatedBlock
      )
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'library',
        draggedItem: mockTemplate,
        isActive: true,
      })
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
            zoom: 100,
            panX: 0,
            panY: 0,
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
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        mockRect as DOMRect
      )

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
            zoom: 100,
            panX: 0,
            panY: 0,
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
    it('should not change background color on mouse enter when dragging', () => {
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
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseEnter(canvas)

      // Canvas should not have drag-over class
      expect(canvas.classList.contains('drag-over')).toBe(false)
    })

    it('should handle mouse leave without changing styles', () => {
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
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseEnter(canvas)
      fireEvent.mouseLeave(canvas)

      // Canvas should never have drag-over class
      expect(canvas.classList.contains('drag-over')).toBe(false)
    })
  })

  describe('Block Rendering', () => {
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
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      expect(
        screen.queryByTestId(`block-${mockBlock.id}`)
      ).not.toBeInTheDocument()
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
            blurSearchInput: mockBlurSearchInput,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.click(blockElement)

      expect(mockSelectBlock).toHaveBeenCalledWith(mockBlock.id)
      expect(mockBlurSearchInput).toHaveBeenCalledTimes(1)
    })

    it('should blur search input when a block is selected via click', () => {
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
            blurSearchInput: mockBlurSearchInput,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.click(blockElement)

      expect(mockBlurSearchInput).toHaveBeenCalledTimes(1)
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

      expect(blockElement).toHaveClass('outline')
      expect(blockElement).toHaveClass('outline-2')
      expect(blockElement).toHaveClass('outline-blue-500')
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

      expect(blockElement).toHaveClass('hover:outline')
      expect(blockElement).toHaveClass('hover:outline-2')
      expect(blockElement).toHaveClass('hover:outline-blue-500')
      expect(blockElement).not.toHaveClass('outline')
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
      Object.defineProperty(event, 'target', {
        value: document.createElement('div'),
        enumerable: true,
      })
      Object.defineProperty(event, 'currentTarget', {
        value: canvas,
        enumerable: true,
      })

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
      Object.defineProperty(clickEvent, 'target', {
        value: canvas,
        enumerable: true,
      })
      Object.defineProperty(clickEvent, 'currentTarget', {
        value: canvas,
        enumerable: true,
      })

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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)

      expect(useKeyboard).toHaveBeenCalled()
    })
  })

  describe('Block Drag Initiation (Task 1)', () => {
    it('should not start drag if already dragging', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true) // Already dragging
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.mouseDown(blockElement, { clientX: 150, clientY: 100 })

      // Should not start a new drag
      expect(dragManager.startDrag).not.toHaveBeenCalled()
      expect(mockSelectBlock).not.toHaveBeenCalled()
      expect(mockSetDragState).not.toHaveBeenCalled()
    })

    it('should stop propagation on mousedown to prevent canvas deselection', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false)
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true })
      const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation')

      blockElement.dispatchEvent(mouseDownEvent)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should add user-select: none to block styles', () => {
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      expect(blockElement.style.userSelect).toBe('none')
    })

    it('should not handle click if dragging (safety check)', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true) // Currently dragging
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.click(blockElement)

      // Should not handle click if dragging
      expect(mockSelectBlock).not.toHaveBeenCalled()
    })

    it('should always select block even if already selected', () => {
      const selectedBlock = { ...mockBlock, selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false)
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      fireEvent.mouseDown(blockElement, { clientX: 150, clientY: 100 })

      // Should still call selectBlock to ensure only this block is selected
      expect(mockSelectBlock).toHaveBeenCalledWith(mockBlock.id)
    })

    it('should not start drag if block not found', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [], // No blocks
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      // Create a dummy element with the block test id but no actual block data
      const { container } = render(<Canvas />)
      const dummyBlock = document.createElement('div')
      dummyBlock.setAttribute('data-testid', 'block-nonexistent')
      container.appendChild(dummyBlock)

      fireEvent.mouseDown(dummyBlock, { clientX: 150, clientY: 100 })

      // Should not start drag if block not found
      expect(dragManager.startDrag).not.toHaveBeenCalled()
    })
  })

  describe('Block Drag Tracking (Task 2)', () => {
    it('should not update position when dragging from library', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: mockTemplate,
            getDragSource: 'library', // Library drag, not canvas
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseMove(canvas, { clientX: 300, clientY: 250 })

      // Should not update any block position for library drags
      expect(mockUpdateBlock).not.toHaveBeenCalled()
    })

    it('should not update position when not dragging', () => {
      const mockBlockWithTemplate = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false) // Not dragging
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [mockBlockWithTemplate],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseMove(canvas, { clientX: 300, clientY: 250 })

      // Should not update position when not dragging
      expect(mockUpdateBlock).not.toHaveBeenCalled()
    })

    it('should not update if dragged item has no id', () => {
      const blockWithoutId = { ...mockBlock, id: undefined }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: blockWithoutId, // No id
            getDragSource: 'canvas',
            getDragOffset: { x: 0, y: 0 },
            blocks: [],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      const mockRect = {
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        width: 1000,
        height: 800,
      }
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
        mockRect as DOMRect
      )

      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 })

      // Should not update if no id
      expect(mockUpdateBlock).not.toHaveBeenCalled()
    })
  })

  describe('Block Drag Completion (Task 3)', () => {
    it('should end drag when mouse up after canvas block drag', () => {
      const draggedBlock = { ...mockBlock, id: 'dragged-block', selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'canvas',
        draggedItem: draggedBlock,
        isActive: true,
      })
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: draggedBlock,
            getDragSource: 'canvas',
            getDragOffset: { x: 10, y: 10 },
            blocks: [draggedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseUp(canvas, { clientX: 300, clientY: 200 })

      // Should end drag for canvas drag
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()

      // Should NOT create new block for canvas drag
      expect(blockRegistry.generateBlockInstance).not.toHaveBeenCalled()
      expect(mockAddBlock).not.toHaveBeenCalled()
    })

    it('should keep block selected after canvas drag completion', () => {
      const draggedBlock = { ...mockBlock, id: 'dragged-block', selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'canvas',
        draggedItem: draggedBlock,
        isActive: true,
      })
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: draggedBlock,
            getDragSource: 'canvas',
            getDragOffset: { x: 10, y: 10 },
            blocks: [draggedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseUp(canvas, { clientX: 300, clientY: 200 })

      // Should not deselect the block after drag
      expect(mockClearSelection).not.toHaveBeenCalled()

      // Block should maintain selected state
      expect(draggedBlock.selected).toBe(true)
    })

    it('should not handle mouse up when not dragging', () => {
      ;(dragManager.isDragging as any).mockReturnValue(false)
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 })

      // Should not call any drag-related functions
      expect(dragManager.endDrag).not.toHaveBeenCalled()
      expect(mockClearDragState).not.toHaveBeenCalled()
      expect(mockAddBlock).not.toHaveBeenCalled()
    })

    it('should handle drag completion with final position already updated', () => {
      const draggedBlock = {
        ...mockBlock,
        id: 'dragged-block',
        selected: true,
        x: 250, // Already moved position
        y: 150,
      }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'canvas',
        draggedItem: draggedBlock,
        isActive: true,
      })
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: draggedBlock,
            getDragSource: 'canvas',
            getDragOffset: { x: 10, y: 10 },
            blocks: [draggedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.mouseUp(canvas, { clientX: 300, clientY: 200 })

      // Should end drag
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()

      // Should NOT update position on mouse up (already updated during drag)
      expect(mockUpdateBlock).not.toHaveBeenCalled()

      // Position should remain at dragged location
      expect(draggedBlock.x).toBe(250)
      expect(draggedBlock.y).toBe(150)
    })
  })

  describe('Multi-Block Drag Prevention (Task 4)', () => {
    it('should only allow dragging one block at a time', () => {
      const block1 = { ...mockBlock, id: 'block-1', selected: false }
      const block2 = {
        ...mockBlock,
        id: 'block-2',
        x: 200,
        y: 100,
        selected: false,
      }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any)
        .mockReturnValueOnce(false)
        .mockReturnValue(true)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [block1, block2],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const firstBlock = screen.getByTestId('block-block-1')
      const secondBlock = screen.getByTestId('block-block-2')

      // Start dragging first block
      fireEvent.mouseDown(firstBlock, { clientX: 100, clientY: 50 })
      expect(dragManager.startDrag).toHaveBeenCalledTimes(1)

      // Try to drag second block while first is being dragged
      fireEvent.mouseDown(secondBlock, { clientX: 200, clientY: 100 })

      // Should not start a new drag since already dragging
      expect(dragManager.startDrag).toHaveBeenCalledTimes(1) // Still only 1 call
    })

    it('should clear multi-selection when starting drag', () => {
      const block1 = { ...mockBlock, id: 'block-1', selected: true }
      const block2 = {
        ...mockBlock,
        id: 'block-2',
        x: 200,
        y: 100,
        selected: true,
      }
      const block3 = {
        ...mockBlock,
        id: 'block-3',
        x: 300,
        y: 150,
        selected: false,
      }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [block1, block2, block3],
            selectedBlockIds: ['block-1', 'block-2'], // Multi-selection
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const secondBlock = screen.getByTestId('block-block-2')

      // Start dragging second block (which is part of multi-selection)
      fireEvent.mouseDown(secondBlock, { clientX: 200, clientY: 100 })

      // Should select only the dragged block (clearing multi-selection)
      expect(mockSelectBlock).toHaveBeenCalledWith('block-2')

      // selectBlock in BlocksSlice automatically deselects all other blocks
      // so we're confirming it was called, which handles the multi-selection clearing
    })

    it('should prevent drag initiation if dragManager.isDragging returns true', () => {
      const block1 = { ...mockBlock, id: 'block-1', selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true) // Already dragging
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: block1,
            getDragSource: 'canvas',
            getDragOffset: { x: 10, y: 10 },
            blocks: [block1],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const block = screen.getByTestId('block-block-1')

      // Try to start drag when already dragging
      fireEvent.mouseDown(block, { clientX: 100, clientY: 50 })

      // Should not call any drag-related functions
      expect(dragManager.startDrag).not.toHaveBeenCalled()
      expect(mockSelectBlock).not.toHaveBeenCalled()
      expect(mockSetDragState).not.toHaveBeenCalled()
    })

    it('should only select the dragged block when multiple blocks exist', () => {
      const block1 = { ...mockBlock, id: 'block-1', selected: false }
      const block2 = {
        ...mockBlock,
        id: 'block-2',
        x: 200,
        y: 100,
        selected: false,
      }
      const block3 = {
        ...mockBlock,
        id: 'block-3',
        x: 300,
        y: 150,
        selected: false,
      }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(false)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [block1, block2, block3],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const middleBlock = screen.getByTestId('block-block-2')

      // Start dragging the middle block
      fireEvent.mouseDown(middleBlock, { clientX: 200, clientY: 100 })

      // Should select only block-2
      expect(mockSelectBlock).toHaveBeenCalledWith('block-2')
      expect(mockSelectBlock).toHaveBeenCalledTimes(1)

      // Should start drag for only this block
      expect(dragManager.startDrag).toHaveBeenCalledWith(
        'canvas',
        expect.objectContaining({ id: 'block-2' }),
        expect.any(Object)
      )
    })
  })

  describe('Edge Cases (Task 5)', () => {
    it('should clear drag state when mouse leaves canvas during canvas drag', () => {
      const draggedBlock = { ...mockBlock, id: 'dragged-block', selected: true }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'canvas',
        draggedItem: draggedBlock,
        isActive: true,
      })
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true,
            getDraggedItem: draggedBlock,
            getDragSource: 'canvas',
            getDragOffset: { x: 10, y: 10 },
            blocks: [draggedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Simulate mouse leave during canvas drag
      fireEvent.mouseLeave(canvas)

      // Should end drag and clear state
      expect(dragManager.endDrag).toHaveBeenCalled()
      expect(mockClearDragState).toHaveBeenCalled()
    })

    it('should not clear drag state when mouse leaves canvas during library drag', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(dragManager.isDragging as any).mockReturnValue(true)
      ;(dragManager.getDragState as any) = vi.fn().mockReturnValue({
        sourceType: 'library',
        draggedItem: mockTemplate,
        isActive: true,
      })
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Simulate mouse leave during library drag
      fireEvent.mouseLeave(canvas)

      // Should NOT end drag for library drags (they can continue outside canvas)
      expect(dragManager.endDrag).not.toHaveBeenCalled()
      expect(mockClearDragState).not.toHaveBeenCalled()
    })

    it('should handle mouse leave without style changes', () => {
      ;(dragManager.isDragging as any).mockReturnValue(false)
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Canvas should maintain white background
      expect(canvas).toHaveClass('bg-white')

      // Simulate mouse leave
      fireEvent.mouseLeave(canvas)

      // Canvas should still have white background
      expect(canvas).toHaveClass('bg-white')
    })

    it('should apply user-select: none to prevent text selection during drag', () => {
      const block = { ...mockBlock, id: 'block-1' }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [block],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId('block-block-1')

      // Check that user-select: none is applied
      const style = window.getComputedStyle(blockElement)
      expect(blockElement.style.userSelect).toBe('none')
    })

    it('should handle mouse leave when not dragging', () => {
      ;(dragManager.isDragging as any).mockReturnValue(false)
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Simulate mouse leave when not dragging
      fireEvent.mouseLeave(canvas)

      // Should not call any drag-related functions
      expect(dragManager.endDrag).not.toHaveBeenCalled()
      expect(mockClearDragState).not.toHaveBeenCalled()
    })

    it('should disable hover effects on blocks when dragging', () => {
      const unselectedBlock = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: true, // Currently dragging
            getDraggedItem: mockTemplate,
            getDragSource: 'library',
            getDragOffset: { x: 0, y: 0 },
            blocks: [unselectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      // Should not have hover class when dragging
      expect(blockElement).not.toHaveClass('hover:outline')
      expect(blockElement).not.toHaveClass('hover:outline-2')
      expect(blockElement).not.toHaveClass('hover:outline-blue-500')
    })

    it('should enable hover effects on blocks when not dragging', () => {
      const unselectedBlock = { ...mockBlock, selected: false }
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false, // Not dragging
            getDraggedItem: null,
            getDragSource: null,
            getDragOffset: { x: 0, y: 0 },
            blocks: [unselectedBlock],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const blockElement = screen.getByTestId(`block-${mockBlock.id}`)

      // Should have hover class when not dragging
      expect(blockElement).toHaveClass('hover:outline')
      expect(blockElement).toHaveClass('hover:outline-2')
      expect(blockElement).toHaveClass('hover:outline-blue-500')
    })
  })

  describe('Dynamic Height Calculation', () => {
    it('should set minimum height based on zoom level when canvas is empty', () => {
      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [], // Empty canvas
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100, // Default zoom
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // At zoom 100%, actualScale = 0.8, so minHeight = 1200 * 0.8 = 960px
      expect(canvas).toHaveStyle({ minHeight: '960px' })
    })

    it('should calculate height based on lowest block position plus 1200px buffer', () => {
      const blocks = [
        { ...mockBlock, id: 'block-1', y: 100, height: 100 }, // bottom at 200
        { ...mockBlock, id: 'block-2', y: 500, height: 200 }, // bottom at 700
        { ...mockBlock, id: 'block-3', y: 300, height: 150 }, // bottom at 450
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Lowest point is 700 (block-2), so world height = 700 + 1200 = 1900px
      // At zoom 100%, actualScale = 0.8, so screen height = 1900 * 0.8 = 1520px
      expect(canvas).toHaveStyle({ minHeight: '1520px' })
    })

    it('should maintain minimum height even with blocks near top', () => {
      const blocks = [
        { ...mockBlock, id: 'block-1', y: 0, height: 50 }, // bottom at 50
        { ...mockBlock, id: 'block-2', y: 10, height: 30 }, // bottom at 40
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Lowest point is block-1 at y=50 (0+50), so world height = max(1200, 50 + 1200) = 1250px
      // At zoom 100%, actualScale = 0.8, so screen height = 1250 * 0.8 = 1000px
      expect(canvas).toHaveStyle({ minHeight: '1000px' })
    })

    it('should recalculate height when blocks are added', () => {
      const initialBlocks = [
        { ...mockBlock, id: 'block-1', y: 100, height: 100 }, // bottom at 200
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      const { rerender } = render(<Canvas />)

      // Initial render with one block
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: initialBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      let canvas = screen.getByTestId('canvas')
      // World height = 200 + 1200 = 1400px
      // At zoom 100%, actualScale = 0.8, so screen height = 1400 * 0.8 = 1120px
      expect(canvas).toHaveStyle({ minHeight: '1120px' })

      // Add a new block further down
      const updatedBlocks = [
        ...initialBlocks,
        { ...mockBlock, id: 'block-2', y: 800, height: 200 }, // bottom at 1000
      ]

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: updatedBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      canvas = screen.getByTestId('canvas')
      // World height = 1000 + 1200 = 2200px
      // At zoom 100%, actualScale = 0.8, so screen height = 2200 * 0.8 = 1760px
      expect(canvas).toHaveStyle({ minHeight: '1760px' })
    })

    it('should recalculate height when blocks are moved', () => {
      const blockAtTop = { ...mockBlock, id: 'block-1', y: 100, height: 100 }

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      const { rerender } = render(<Canvas />)

      // Initial position
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [blockAtTop],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      let canvas = screen.getByTestId('canvas')
      // World height = 200 + 1200 = 1400px
      // At zoom 100%, actualScale = 0.8, so screen height = 1400 * 0.8 = 1120px
      expect(canvas).toHaveStyle({ minHeight: '1120px' })

      // Move block further down
      const blockMovedDown = { ...blockAtTop, y: 1500 }

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: [blockMovedDown],
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      canvas = screen.getByTestId('canvas')
      // World height = 1600 + 1200 = 2800px
      // At zoom 100%, actualScale = 0.8, so screen height = 2800 * 0.8 = 2240px
      expect(canvas).toHaveStyle({ minHeight: '2240px' })
    })

    it('should recalculate height when blocks are removed', () => {
      const blocks = [
        { ...mockBlock, id: 'block-1', y: 100, height: 100 }, // bottom at 200
        { ...mockBlock, id: 'block-2', y: 1000, height: 200 }, // bottom at 1200
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      const { rerender } = render(<Canvas />)

      // Initial render with two blocks
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      let canvas = screen.getByTestId('canvas')
      // World height = 1200 + 1200 = 2400px
      // At zoom 100%, actualScale = 0.8, so screen height = 2400 * 0.8 = 1920px
      expect(canvas).toHaveStyle({ minHeight: '1920px' })

      // Remove the lower block
      const remainingBlocks = [blocks[0]]

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: remainingBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      canvas = screen.getByTestId('canvas')
      // World height = 200 + 1200 = 1400px
      // At zoom 100%, actualScale = 0.8, so screen height = 1400 * 0.8 = 1120px
      expect(canvas).toHaveStyle({ minHeight: '1120px' })
    })
  })

  describe('Scrolling Behavior', () => {
    it('should apply overflow-y-auto to container for vertical scrolling', () => {
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')

      // Container should have overflow-y-auto for scrolling
      expect(container).toHaveClass('overflow-y-auto')
      expect(container).toHaveClass('overflow-x-hidden')
    })

    it('should not apply overflow styles to canvas itself', () => {
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Canvas should not have overflow classes (handled by container)
      expect(canvas).not.toHaveClass('overflow-y-auto')
      expect(canvas).not.toHaveClass('overflow-x-hidden')
      expect(canvas).not.toHaveClass('overflow-auto')
      expect(canvas).not.toHaveClass('overflow-hidden')
    })

    it('should enable vertical scrolling when canvas height exceeds viewport', () => {
      // Create blocks that will make canvas height exceed typical viewport
      const tallBlocks = [
        { ...mockBlock, id: 'block-1', y: 100, height: 200 },
        { ...mockBlock, id: 'block-2', y: 500, height: 200 },
        { ...mockBlock, id: 'block-3', y: 1000, height: 200 },
        { ...mockBlock, id: 'block-4', y: 1500, height: 200 }, // bottom at 1700
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: tallBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')
      const canvas = screen.getByTestId('canvas')

      // Canvas height should be 1700 + 1200 = 2900px
      // World height = 1700 + 1200 = 2900px
      // At zoom 100%, actualScale = 0.8, so screen height = 2900 * 0.8 = 2320px
      expect(canvas).toHaveStyle({ minHeight: '2320px' })

      // Container should have scrolling capability
      expect(container).toHaveClass('overflow-y-auto')

      // Container should be full height within parent
      expect(container).toHaveClass('h-full')
    })

    it('should maintain horizontal centering with mx-auto during scroll', () => {
      const tallBlocks = [
        { ...mockBlock, id: 'block-1', y: 2000, height: 200 }, // Far down to ensure scrolling
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: tallBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Canvas should maintain horizontal centering
      expect(canvas).toHaveClass('mx-auto')

      // Canvas width should be based on zoom (1200 * 0.8 = 960px at default zoom)
      expect(canvas).toHaveStyle({ width: '960px' })
    })

    it('should handle container scrolling without affecting canvas positioning', () => {
      const manyBlocks = Array.from({ length: 10 }, (_, i) => ({
        ...mockBlock,
        id: `block-${i}`,
        y: i * 300,
        height: 200,
      }))

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: manyBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')
      const canvas = screen.getByTestId('canvas')

      // Simulate scrolling by setting scrollTop
      Object.defineProperty(container, 'scrollTop', {
        writable: true,
        value: 500,
      })

      // Canvas should still be positioned correctly within container
      expect(canvas).toHaveClass('relative')
      expect(canvas).toHaveClass('mx-auto')

      // Container handles the scrolling
      expect(container).toHaveClass('overflow-y-auto')
    })

    it('should not enable horizontal scrolling even with wide canvas', () => {
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
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      render(<Canvas />)
      const container = screen.getByTestId('canvas-container')

      // Container should hide horizontal overflow
      expect(container).toHaveClass('overflow-x-hidden')

      // Canvas width is based on zoom (1200 * 0.8 = 960px at default zoom)
      const canvas = screen.getByTestId('canvas')
      expect(canvas).toHaveStyle({ width: '960px' })
    })

    it('should adjust scrollable area when blocks are added/removed dynamically', () => {
      const initialBlocks = [
        { ...mockBlock, id: 'block-1', y: 100, height: 100 }, // bottom at 200
      ]

      ;(blockRegistry.getTemplate as any).mockReturnValue(mockTemplate)

      const { rerender } = render(<Canvas />)

      // Initial state with one block
      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: initialBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      let canvas = screen.getByTestId('canvas')
      // World height = 200 + 1200 = 1400px
      // At zoom 100%, actualScale = 0.8, so screen height = 1400 * 0.8 = 1120px
      expect(canvas).toHaveStyle({ minHeight: '1120px' })

      // Add blocks that extend the canvas
      const extendedBlocks = [
        ...initialBlocks,
        { ...mockBlock, id: 'block-2', y: 2000, height: 200 }, // bottom at 2200
      ]

      ;(useAppStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const state = {
            isDragging: false,
            blocks: extendedBlocks,
            clearDragState: mockClearDragState,
            addBlock: mockAddBlock,
            getHighestZIndex: mockGetHighestZIndex,
            selectBlock: mockSelectBlock,
            clearSelection: mockClearSelection,
            updateBlock: mockUpdateBlock,
            setDragState: mockSetDragState,
            zoom: 100,
            panX: 0,
            panY: 0,
          }
          return selector(state)
        }
        return null
      })

      rerender(<Canvas />)
      canvas = screen.getByTestId('canvas')

      // Scrollable area should expand
      // World height = 2200 + 1200 = 3400px
      // At zoom 100%, actualScale = 0.8, so screen height = 3400 * 0.8 = 2720px
      expect(canvas).toHaveStyle({ minHeight: '2720px' })

      const container = screen.getByTestId('canvas-container')
      expect(container).toHaveClass('overflow-y-auto')
    })
  })

  describe('Zoom functionality', () => {
    let mockStore: any

    beforeEach(() => {
      mockStore = {
        isDragging: false,
        getDraggedItem: null,
        getDragSource: null,
        getDragOffset: null,
        clearDragState: vi.fn(),
        addBlock: vi.fn(),
        updateBlock: vi.fn(),
        getHighestZIndex: vi.fn(() => 0),
        blocks: [],
        selectBlock: vi.fn(),
        clearSelection: vi.fn(),
        setDragState: vi.fn(),
        blurSearchInput: vi.fn(),
        zoom: 100, // Default zoom
        panX: 0,
        panY: 0,
      }
      ;(useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: any) => {
          if (typeof selector === 'function') {
            return selector(mockStore)
          }
          return mockStore
        }
      )
    })

    it('should apply zoom transform to block positions', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100, // World coordinate
        y: 200, // World coordinate
        width: 150,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 125 // 125% zoom = 1.0 scale

      // Mock the template and component
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      render(<Canvas />)

      const block = screen.getByTestId('block-test-block')

      // At 125% zoom (1.0 scale), world coordinates = screen coordinates
      expect(block).toHaveStyle({
        left: '100px',
        top: '200px',
        width: '150px',
        height: '100px',
      })
    })

    it('should scale blocks at different zoom levels', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100, // World coordinate
        y: 100, // World coordinate
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]

      // Mock the template and component
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      // Test at 50% zoom (0.4 scale)
      mockStore.zoom = 50
      const { rerender } = render(<Canvas />)
      let block = screen.getByTestId('block-test-block')
      expect(block).toHaveStyle({
        left: '40px', // 100 * 0.4
        top: '40px', // 100 * 0.4
        width: '40px', // 100 * 0.4
        height: '40px', // 100 * 0.4
      })

      // Test at 200% zoom (1.6 scale)
      mockStore.zoom = 200
      rerender(<Canvas />)
      block = screen.getByTestId('block-test-block')
      expect(block).toHaveStyle({
        left: '160px', // 100 * 1.6
        top: '160px', // 100 * 1.6
        width: '160px', // 100 * 1.6
        height: '160px', // 100 * 1.6
      })
    })

    it('should apply pan offsets to block positions', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 100 // 0.8 scale
      mockStore.panX = 50
      mockStore.panY = 30

      // Mock the template and component
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      render(<Canvas />)

      const block = screen.getByTestId('block-test-block')

      // Position = world * scale + pan
      expect(block).toHaveStyle({
        left: '130px', // 100 * 0.8 + 50
        top: '110px', // 100 * 0.8 + 30
      })
    })

    it('should scale block content proportionally with zoom', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]

      // Mock the template and component
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      // Test at 100% zoom (0.8 scale)
      mockStore.zoom = 100
      const { rerender } = render(<Canvas />)
      let block = screen.getByTestId('block-test-block')
      // The inner div should have the transform scale
      const innerDiv = block.firstElementChild as HTMLElement
      expect(innerDiv).toHaveStyle({
        transform: 'scale(0.8)', // 0.8 scale
        transformOrigin: 'top left',
        width: '100px',
        height: '100px',
      })

      // Test at 125% zoom (1.0 scale)
      mockStore.zoom = 125
      rerender(<Canvas />)
      block = screen.getByTestId('block-test-block')
      const innerDiv125 = block.firstElementChild as HTMLElement
      expect(innerDiv125).toHaveStyle({
        transform: 'scale(1)', // 1.0 scale
      })

      // Test at 200% zoom (1.6 scale)
      mockStore.zoom = 200
      rerender(<Canvas />)
      block = screen.getByTestId('block-test-block')
      const innerDiv200 = block.firstElementChild as HTMLElement
      expect(innerDiv200).toHaveStyle({
        transform: 'scale(1.6)', // 1.6 scale
      })
    })

    it('should maintain world coordinates in block state', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100, // These should remain constant
        y: 200,
        width: 150,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]

      // Mock the template and component
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      // Change zoom level
      mockStore.zoom = 50
      const { rerender } = render(<Canvas />)

      // Block state should still have world coordinates
      expect(mockStore.blocks[0].x).toBe(100)
      expect(mockStore.blocks[0].y).toBe(200)
      expect(mockStore.blocks[0].width).toBe(150)
      expect(mockStore.blocks[0].height).toBe(100)

      // Change zoom again
      mockStore.zoom = 200
      rerender(<Canvas />)

      // World coordinates should remain unchanged
      expect(mockStore.blocks[0].x).toBe(100)
      expect(mockStore.blocks[0].y).toBe(200)
      expect(mockStore.blocks[0].width).toBe(150)
      expect(mockStore.blocks[0].height).toBe(100)
    })
  })
})
