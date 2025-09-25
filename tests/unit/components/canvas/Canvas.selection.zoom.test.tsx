import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store'
import { blockRegistry } from '@/lib/blocks/registry'
import { dragManager } from '@/lib/drag/manager'
import type { Block, BlockTemplate } from '@/types'

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

// Mock drag manager
vi.mock('@/lib/drag/manager', () => ({
  dragManager: {
    isDragging: vi.fn(),
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    cancelDrag: vi.fn(),
    getDragState: vi.fn(),
  },
}))

// Mock block registry
vi.mock('@/lib/blocks/registry', () => ({
  blockRegistry: {
    generateBlockInstance: vi.fn(),
    getTemplate: vi.fn(),
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

describe('Canvas Block Selection with Zoom', () => {
  let mockStore: any
  let mockSelectBlock: ReturnType<typeof vi.fn>
  let mockClearSelection: ReturnType<typeof vi.fn>
  let mockBlurSearchInput: ReturnType<typeof vi.fn>

  const mockTemplate: BlockTemplate = {
    typeId: 'test-template',
    name: 'Test Template',
    category: 'Test',
    defaultWidth: 200,
    defaultHeight: 150,
    component: () => <div>Test Component</div>,
  }

  beforeEach(() => {
    mockSelectBlock = vi.fn()
    mockClearSelection = vi.fn()
    mockBlurSearchInput = vi.fn()

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
      selectBlock: mockSelectBlock,
      clearSelection: mockClearSelection,
      setDragState: vi.fn(),
      blurSearchInput: mockBlurSearchInput,
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

    ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(false)
    ;(dragManager.getDragState as ReturnType<typeof vi.fn>).mockReturnValue({
      sourceType: null,
    })

    ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue(
      mockTemplate
    )
  })

  describe('Block click selection at different zoom levels', () => {
    it('should select block when clicked at 50% zoom', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 50 // 50% zoom = 0.4 scale

      render(<Canvas />)
      const block = screen.getByTestId('block-test-block')

      // Click on the block
      fireEvent.click(block)

      // Should select the block regardless of zoom level
      expect(mockSelectBlock).toHaveBeenCalledWith('test-block')
      expect(mockBlurSearchInput).toHaveBeenCalled()
    })

    it('should select block when clicked at 200% zoom', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 200 // 200% zoom = 1.6 scale

      render(<Canvas />)
      const block = screen.getByTestId('block-test-block')

      // Click on the block
      fireEvent.click(block)

      // Should select the block regardless of zoom level
      expect(mockSelectBlock).toHaveBeenCalledWith('test-block')
      expect(mockBlurSearchInput).toHaveBeenCalled()
    })

    it('should select correct block when multiple blocks overlap at different zoom', () => {
      const block1: Block = {
        id: 'block-1',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      const block2: Block = {
        id: 'block-2',
        typeId: 'test-type',
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        z: 2, // Higher z-index
        props: {},
        selected: false,
      }

      mockStore.blocks = [block1, block2]
      mockStore.zoom = 125 // 125% zoom = 1.0 scale

      render(<Canvas />)
      const blockElement2 = screen.getByTestId('block-block-2')

      // Click on block 2
      fireEvent.click(blockElement2)

      // Should select block 2 (top block)
      expect(mockSelectBlock).toHaveBeenCalledWith('block-2')
      expect(mockSelectBlock).not.toHaveBeenCalledWith('block-1')
    })
  })

  describe('Canvas click deselection at different zoom levels', () => {
    it('should clear selection when clicking empty canvas area at 50% zoom', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: true,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 50 // 50% zoom = 0.4 scale

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Click directly on canvas (not on block)
      fireEvent.click(canvas)

      // Should clear selection
      expect(mockClearSelection).toHaveBeenCalled()
    })

    it('should clear selection when clicking empty canvas area at 200% zoom', () => {
      mockStore.blocks = []
      mockStore.zoom = 200 // 200% zoom = 1.6 scale

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Click on empty canvas
      fireEvent.click(canvas)

      // Should clear selection
      expect(mockClearSelection).toHaveBeenCalled()
    })

    it('should not clear selection when clicking on block at any zoom', () => {
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
      mockStore.zoom = 150 // 150% zoom = 1.2 scale

      render(<Canvas />)
      const block = screen.getByTestId('block-test-block')

      // Click on block
      fireEvent.click(block)

      // Should select block but not clear selection
      expect(mockSelectBlock).toHaveBeenCalledWith('test-block')
      expect(mockClearSelection).not.toHaveBeenCalled()
    })
  })

  describe('Selection with pan offset', () => {
    it('should select block correctly with pan offset', () => {
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
      mockStore.panX = 50 // Panned right
      mockStore.panY = 30 // Panned down

      render(<Canvas />)
      const block = screen.getByTestId('block-test-block')

      // Block is visually shifted by pan offset but click still works
      fireEvent.click(block)

      expect(mockSelectBlock).toHaveBeenCalledWith('test-block')
    })

    it('should clear selection when clicking canvas with pan offset', () => {
      mockStore.blocks = []
      mockStore.zoom = 100
      mockStore.panX = -100 // Panned left
      mockStore.panY = -50 // Panned up

      render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      fireEvent.click(canvas)

      expect(mockClearSelection).toHaveBeenCalled()
    })
  })

  describe('Selection behavior edge cases', () => {
    it('should not select block when dragging', () => {
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
      mockStore.zoom = 100

      ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(true)

      render(<Canvas />)
      const block = screen.getByTestId('block-test-block')

      // Click on block while dragging
      fireEvent.click(block)

      // Should not select because dragging is active
      expect(mockSelectBlock).not.toHaveBeenCalled()
    })

    it('should maintain selection state through zoom changes', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: true, // Already selected
      }

      // Render at 100% zoom with selected block
      mockStore.blocks = [testBlock]
      mockStore.zoom = 100

      const { rerender } = render(<Canvas />)

      // Change zoom to 150%
      mockStore.zoom = 150
      rerender(<Canvas />)

      // Block should still be rendered as selected
      const block = screen.getByTestId('block-test-block')
      expect(block).toHaveAttribute('data-selected', 'true')
    })

    it('should handle rapid selection changes at different zoom levels', () => {
      const block1: Block = {
        id: 'block-1',
        typeId: 'test-type',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      const block2: Block = {
        id: 'block-2',
        typeId: 'test-type',
        x: 200,
        y: 50,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [block1, block2]
      mockStore.zoom = 75 // 75% zoom

      render(<Canvas />)

      const blockElement1 = screen.getByTestId('block-block-1')
      const blockElement2 = screen.getByTestId('block-block-2')
      const canvas = screen.getByTestId('canvas')

      // Rapid selection sequence
      fireEvent.click(blockElement1)
      expect(mockSelectBlock).toHaveBeenCalledWith('block-1')

      fireEvent.click(blockElement2)
      expect(mockSelectBlock).toHaveBeenCalledWith('block-2')

      fireEvent.click(canvas)
      expect(mockClearSelection).toHaveBeenCalled()

      // All selections should work correctly regardless of zoom
      expect(mockSelectBlock).toHaveBeenCalledTimes(2)
      expect(mockClearSelection).toHaveBeenCalledTimes(1)
    })
  })
})