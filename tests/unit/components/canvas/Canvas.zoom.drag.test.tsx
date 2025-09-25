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

describe('Canvas Drag and Drop with Zoom', () => {
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

    ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(false)
    ;(dragManager.getDragState as ReturnType<typeof vi.fn>).mockReturnValue({
      sourceType: null,
    })
  })

  describe('Block dragging with zoom', () => {
    it('should calculate correct drag offset at 50% zoom', () => {
      const testBlock: Block = {
        id: 'test-block',
        typeId: 'test-type',
        x: 100, // World coordinates
        y: 100,
        width: 100,
        height: 100,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.blocks = [testBlock]
      mockStore.zoom = 50 // 50% zoom = 0.4 scale

      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      const { container } = render(<Canvas />)
      const canvas = screen.getByTestId('canvas')
      const block = screen.getByTestId('block-test-block')

      // Mock canvas getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 600,
        bottom: 400,
        width: 500,
        height: 300,
        x: 100,
        y: 100,
      } as DOMRect))

      // Simulate mouse down on block
      // Block is at screen position: 100 * 0.4 = 40px
      // Mouse clicks at screen position 60px (relative to canvas)
      fireEvent.mouseDown(block, {
        clientX: 160, // 100 + 60
        clientY: 160, // 100 + 60
      })

      // Check that setDragState was called with correct world coordinate offset
      expect(mockStore.setDragState).toHaveBeenCalledWith({
        offset: {
          x: 50, // (60 / 0.4) - 100 = 150 - 100 = 50
          y: 50, // Same calculation for y
        },
        isActive: true,
        sourceType: 'canvas',
        draggedItem: testBlock,
      })
    })

    it('should update block position correctly during drag at 200% zoom', () => {
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
      mockStore.zoom = 200 // 200% zoom = 1.6 scale
      mockStore.getDragSource = 'canvas'
      mockStore.sourceType = 'canvas'
      mockStore.getDraggedItem = testBlock
      mockStore.draggedItem = testBlock
      mockStore.offset = { x: 10, y: 10 } // World coordinate offset
      mockStore.getDragOffset = { x: 10, y: 10 }

      ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(true)
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      const { container } = render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Mock canvas getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 1100,
        bottom: 700,
        width: 1000,
        height: 600,
        x: 100,
        y: 100,
      } as DOMRect))

      // Simulate mouse move during drag
      // Mouse at screen position 260, 260 (absolute)
      fireEvent.mouseMove(canvas, {
        clientX: 260,
        clientY: 260,
      })

      // At 200% zoom (1.6 scale):
      // Screen position relative to canvas: 160, 160
      // World position: 160 / 1.6 = 100
      // After offset: 100 - 10 = 90
      expect(mockStore.updateBlock).toHaveBeenCalledWith('test-block', {
        x: 90,
        y: 90,
      })
    })
  })

  describe('Library drop with zoom', () => {
    it('should calculate correct drop position at 125% zoom', () => {
      const mockTemplate: BlockTemplate = {
        typeId: 'test-template',
        name: 'Test Template',
        category: 'Test',
        defaultWidth: 200,
        defaultHeight: 150,
        component: () => <div>Template</div>,
      }

      const mockNewBlock: Block = {
        id: 'new-block',
        typeId: 'test-template',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.isDragging = true
      mockStore.getDraggedItem = mockTemplate
      mockStore.draggedItem = mockTemplate
      mockStore.getDragSource = 'library'
      mockStore.zoom = 125 // 125% zoom = 1.0 scale
      mockStore.offset = { x: 50, y: 30 } // Click offset in template
      mockStore.getDragOffset = { x: 50, y: 30 }

      ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(true)
      ;(dragManager.getDragState as ReturnType<typeof vi.fn>).mockReturnValue({
        sourceType: 'library',
      })
      ;(blockRegistry.generateBlockInstance as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNewBlock
      )

      const { container } = render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Mock canvas getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        right: 1300,
        bottom: 900,
        width: 1200, // At 125% zoom
        height: 800,
        x: 100,
        y: 100,
      } as DOMRect))

      // Simulate drop at screen position
      fireEvent.mouseUp(canvas, {
        clientX: 350, // 100 + 250
        clientY: 280, // 100 + 180
      })

      // At 125% zoom (1.0 scale):
      // Screen position relative to canvas: 250, 180
      // World position: 250 / 1.0 = 250
      // After offset: 250 - 50 = 200 (x), 180 - 30 = 150 (y)
      expect(mockStore.addBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 200,
          y: 150,
        })
      )
    })

    it('should constrain drop position to canvas boundaries at any zoom', () => {
      const mockTemplate: BlockTemplate = {
        typeId: 'test-template',
        name: 'Test Template',
        category: 'Test',
        defaultWidth: 400,
        defaultHeight: 200,
        component: () => <div>Template</div>,
      }

      const mockNewBlock: Block = {
        id: 'new-block',
        typeId: 'test-template',
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        z: 1,
        props: {},
        selected: false,
      }

      mockStore.isDragging = true
      mockStore.getDraggedItem = mockTemplate
      mockStore.draggedItem = mockTemplate
      mockStore.getDragSource = 'library'
      mockStore.zoom = 50 // 50% zoom = 0.4 scale
      mockStore.offset = { x: 0, y: 0 }
      mockStore.getDragOffset = { x: 0, y: 0 }

      ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(true)
      ;(dragManager.getDragState as ReturnType<typeof vi.fn>).mockReturnValue({
        sourceType: 'library',
      })
      ;(blockRegistry.generateBlockInstance as ReturnType<typeof vi.fn>).mockReturnValue(
        mockNewBlock
      )

      const { container } = render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      // Mock canvas getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 480, // 1200 * 0.4
        bottom: 320,
        width: 480,
        height: 320,
        x: 0,
        y: 0,
      } as DOMRect))

      // Try to drop beyond right edge
      fireEvent.mouseUp(canvas, {
        clientX: 460, // Would be 1150 in world coords (460 / 0.4)
        clientY: 100,
      })

      // Should constrain to: 1200 - 400 = 800 (max x for 400px wide block)
      expect(mockStore.addBlock).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 800, // Constrained to max position
          y: 250, // 100 / 0.4 = 250
        })
      )
    })
  })

  describe('Drag position updates with pan offset', () => {
    it('should account for pan offset when dragging', () => {
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
      mockStore.panX = 50 // Panned 50px right
      mockStore.panY = 30 // Panned 30px down
      mockStore.getDragSource = 'canvas'
      mockStore.sourceType = 'canvas'
      mockStore.getDraggedItem = testBlock
      mockStore.draggedItem = testBlock
      mockStore.offset = { x: 0, y: 0 }
      mockStore.getDragOffset = { x: 0, y: 0 }

      ;(dragManager.isDragging as ReturnType<typeof vi.fn>).mockReturnValue(true)
      ;(blockRegistry.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        component: () => <div>Test Component</div>,
      })

      const { container } = render(<Canvas />)
      const canvas = screen.getByTestId('canvas')

      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 960,
        bottom: 600,
        width: 960,
        height: 600,
        x: 0,
        y: 0,
      } as DOMRect))

      // Simulate mouse move
      fireEvent.mouseMove(canvas, {
        clientX: 130, // Screen position
        clientY: 110,
      })

      // With pan offset:
      // Screen to world: (130 - 50) / 0.8 = 100
      // (110 - 30) / 0.8 = 100
      expect(mockStore.updateBlock).toHaveBeenCalledWith('test-block', {
        x: 100,
        y: 100,
      })
    })
  })
})