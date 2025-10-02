import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Canvas } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store'
import { blockRegistry } from '@/lib/blocks/registry'
import { dragManager } from '@/lib/drag/manager'
import { screenToWorld, worldToScreen } from '@/lib/canvas/transforms'
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

  describe('Coordinate transformations with zoom', () => {
    it('should transform screen to world coordinates at 50% zoom', () => {
      // At 50% zoom, actualScale = 50 * 0.008 = 0.4
      const zoom = 50
      const panX = 0
      const panY = 0

      // Screen position 60px should transform to world position 150px
      // worldX = screenX / actualScale = 60 / 0.4 = 150
      const worldPos = screenToWorld(60, 60, zoom, panX, panY)

      expect(worldPos.x).toBe(150)
      expect(worldPos.y).toBe(150)
    })

    it('should transform screen to world coordinates at 200% zoom', () => {
      // At 200% zoom, actualScale = 200 * 0.008 = 1.6
      const zoom = 200
      const panX = 0
      const panY = 0

      // Screen position 160px should transform to world position 100px
      // worldX = screenX / actualScale = 160 / 1.6 = 100
      const worldPos = screenToWorld(160, 160, zoom, panX, panY)

      expect(worldPos.x).toBe(100)
      expect(worldPos.y).toBe(100)
    })

    it('should account for pan offset when transforming coordinates', () => {
      // At 100% zoom, actualScale = 100 * 0.008 = 0.8
      const zoom = 100
      const panX = 50
      const panY = 30

      // Screen position with pan:
      // worldX = (screenX - panX) / actualScale = (130 - 50) / 0.8 = 100
      // worldY = (screenY - panY) / actualScale = (110 - 30) / 0.8 = 100
      const worldPos = screenToWorld(130, 110, zoom, panX, panY)

      expect(worldPos.x).toBe(100)
      expect(worldPos.y).toBe(100)
    })

    it('should transform world to screen coordinates correctly', () => {
      // At 100% zoom, actualScale = 0.8
      const zoom = 100
      const panX = 0
      const panY = 0

      // World position 100px should transform to screen position 80px
      // screenX = worldX * actualScale + panX = 100 * 0.8 + 0 = 80
      const screenPos = worldToScreen(100, 100, zoom, panX, panY)

      expect(screenPos.x).toBe(80)
      expect(screenPos.y).toBe(80)
    })

    it('should apply pan offset when transforming world to screen', () => {
      const zoom = 100
      const panX = 20
      const panY = 10

      // screenX = worldX * actualScale + panX = 100 * 0.8 + 20 = 100
      const screenPos = worldToScreen(100, 100, zoom, panX, panY)

      expect(screenPos.x).toBe(100)
      expect(screenPos.y).toBe(90)
    })
  })
})