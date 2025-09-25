import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Canvas } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store'
import { blockRegistry } from '@/lib/blocks/registry'
import type { Block } from '@/types/block'

// Helper to create test blocks
const createTestBlock = (overrides: Partial<Block> = {}): Block => ({
  id: 'test-block',
  typeId: 'hero-header',
  x: 0,
  y: 0,
  width: 300,
  height: 200,
  z: 1,
  selected: false,
  props: {},
  ...overrides,
})

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

// Mock the block registry
vi.mock('@/lib/blocks/registry', () => ({
  blockRegistry: {
    getTemplate: vi.fn(),
    generateBlockInstance: vi.fn(),
  },
}))

// Mock drag manager
vi.mock('@/lib/drag/manager', () => ({
  dragManager: {
    isDragging: vi.fn().mockReturnValue(false),
    getDragState: vi.fn(),
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    cancelDrag: vi.fn(),
  },
}))

// Mock the useKeyboard hook
vi.mock('@/hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))

describe('Canvas Scrolling with Zoom', () => {
  const mockBlock = createTestBlock({
    id: 'block-1',
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    z: 1,
    typeId: 'hero-header',
    selected: false,
  })

  const TestComponent = () => <div>Test Block Content</div>

  const defaultMockState = {
    // Drag state
    isDragging: false,
    draggedItem: null,
    sourceType: null,
    offset: null,
    clearDragState: vi.fn(),
    setDragState: vi.fn(),

    // Blocks state
    blocks: [mockBlock],
    addBlock: vi.fn(),
    updateBlock: vi.fn(),
    selectBlock: vi.fn(),
    clearSelection: vi.fn(),
    getHighestZIndex: vi.fn().mockReturnValue(1),

    // UI state - default zoom (100%)
    zoom: 100,
    panX: 0,
    panY: 0,
    blurSearchInput: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock block template
    ;(blockRegistry.getTemplate as any).mockReturnValue({
      typeId: 'hero-header',
      component: TestComponent,
    })
  })

  it('should have overflow-auto on canvas container', () => {
    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(defaultMockState)
      }
      return defaultMockState
    })

    render(<Canvas />)

    const container = screen.getByTestId('canvas-container')
    expect(container).toHaveClass('overflow-auto')
  })

  it('should allow horizontal scrolling when canvas width exceeds container at high zoom', () => {
    // Set zoom to 200% which will make canvas 1920px wide (1200 * 0.008 * 200 = 1920)
    const zoomedState = {
      ...defaultMockState,
      zoom: 200,
    }

    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(zoomedState)
      }
      return zoomedState
    })

    render(<Canvas />)

    const canvas = screen.getByTestId('canvas')
    const container = screen.getByTestId('canvas-container')

    // Canvas at 200% zoom should be 1920px wide (1200 * 1.6 scale)
    expect(canvas).toHaveStyle({
      width: '1920px'
    })

    // Container has overflow-auto to allow scrolling
    expect(container).toHaveClass('overflow-auto')
  })

  it('should allow vertical scrolling when canvas height exceeds container', () => {
    // Add blocks that extend canvas height
    const tallBlocks = [
      createTestBlock({ id: 'block-1', y: 100, height: 200 }),
      createTestBlock({ id: 'block-2', y: 500, height: 300 }),
      createTestBlock({ id: 'block-3', y: 1000, height: 400 }),
      createTestBlock({ id: 'block-4', y: 1500, height: 500 }),
    ]

    const tallState = {
      ...defaultMockState,
      blocks: tallBlocks,
      zoom: 150, // Zoom in to make scrolling more likely
    }

    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(tallState)
      }
      return tallState
    })

    render(<Canvas />)

    const canvas = screen.getByTestId('canvas')
    const container = screen.getByTestId('canvas-container')

    // Canvas height should be calculated based on lowest block (1500 + 500 + 1200 = 3200)
    // At 150% zoom with 0.008 scale = 1.2 actual scale
    const expectedHeight = 3200 * 1.2
    expect(canvas).toHaveStyle({
      minHeight: `${expectedHeight}px`
    })

    // Container has overflow-auto to allow scrolling
    expect(container).toHaveClass('overflow-auto')
  })

  it('should not need scrolling at low zoom levels', () => {
    // Set zoom to 25% which will make canvas smaller
    const lowZoomState = {
      ...defaultMockState,
      zoom: 25,
    }

    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(lowZoomState)
      }
      return lowZoomState
    })

    render(<Canvas />)

    const canvas = screen.getByTestId('canvas')
    const container = screen.getByTestId('canvas-container')

    // Canvas at 25% zoom should be 240px wide (1200 * 0.2 scale)
    expect(canvas).toHaveStyle({
      width: '240px'
    })

    // Container still has overflow-auto but likely won't need it at this zoom
    expect(container).toHaveClass('overflow-auto')
  })

  it('should handle both horizontal and vertical scrolling simultaneously', () => {
    // Create scenario where both dimensions exceed container
    const manyBlocks = [
      createTestBlock({ id: 'block-1', x: 50, y: 100, width: 300, height: 200 }),
      createTestBlock({ id: 'block-2', x: 400, y: 500, width: 400, height: 300 }),
      createTestBlock({ id: 'block-3', x: 850, y: 1000, width: 300, height: 400 }),
      createTestBlock({ id: 'block-4', x: 600, y: 2000, width: 500, height: 500 }),
    ]

    const fullState = {
      ...defaultMockState,
      blocks: manyBlocks,
      zoom: 175, // High zoom to exceed container bounds
    }

    ;(useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(fullState)
      }
      return fullState
    })

    render(<Canvas />)

    const canvas = screen.getByTestId('canvas')
    const container = screen.getByTestId('canvas-container')

    // At 175% zoom with 0.008 scale = 1.4 actual scale
    const expectedWidth = 1200 * 1.4
    const expectedHeight = 3700 * 1.4 // Based on lowest block (2000 + 500 + 1200)

    // Use more flexible matching for floating point values
    const canvasStyle = window.getComputedStyle(canvas)
    const actualWidth = parseFloat(canvasStyle.width)
    const actualHeight = parseFloat(canvasStyle.minHeight)

    expect(actualWidth).toBeCloseTo(expectedWidth, 5)
    expect(actualHeight).toBeCloseTo(expectedHeight, 5)

    // Container allows both horizontal and vertical scrolling
    expect(container).toHaveClass('overflow-auto')
    expect(container).not.toHaveClass('overflow-x-hidden')
    expect(container).not.toHaveClass('overflow-y-auto')
  })
})