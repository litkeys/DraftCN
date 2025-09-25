import { describe, it, expect, vi } from 'vitest'
import {
  calculateActualScale,
  screenToWorld,
  worldToScreen,
  worldDimensionsToScreen,
  screenDimensionsToWorld,
  getWorldMousePosition,
  isPointInWorldRect,
} from '@/lib/canvas/transforms'

describe('Transform Utilities', () => {
  describe('calculateActualScale', () => {
    it('should calculate actual scale correctly', () => {
      expect(calculateActualScale(100)).toBe(0.8)
      expect(calculateActualScale(125)).toBe(1.0)
      expect(calculateActualScale(25)).toBe(0.2)
      expect(calculateActualScale(200)).toBe(1.6)
      expect(calculateActualScale(50)).toBe(0.4)
      expect(calculateActualScale(75)).toBe(0.6)
      expect(calculateActualScale(150)).toBe(1.2)
      expect(calculateActualScale(175)).toBeCloseTo(1.4)
    })
  })

  describe('screenToWorld', () => {
    it('should convert screen to world coordinates correctly at 100% zoom', () => {
      const result = screenToWorld(800, 600, 100, 0, 0)
      expect(result.x).toBe(1000) // 800 / 0.8
      expect(result.y).toBe(750) // 600 / 0.8
    })

    it('should convert screen to world coordinates correctly at 125% zoom (1:1 scale)', () => {
      const result = screenToWorld(800, 600, 125, 0, 0)
      expect(result.x).toBe(800) // 800 / 1.0
      expect(result.y).toBe(600) // 600 / 1.0
    })

    it('should handle pan offsets in transformations', () => {
      const result = screenToWorld(800, 600, 100, 100, 50)
      expect(result.x).toBe(875) // (800 - 100) / 0.8
      expect(result.y).toBe(687.5) // (600 - 50) / 0.8
    })

    it('should convert at different zoom levels', () => {
      const result50 = screenToWorld(400, 300, 50, 0, 0)
      expect(result50.x).toBe(1000) // 400 / 0.4
      expect(result50.y).toBe(750) // 300 / 0.4

      const result200 = screenToWorld(1600, 1200, 200, 0, 0)
      expect(result200.x).toBe(1000) // 1600 / 1.6
      expect(result200.y).toBe(750) // 1200 / 1.6
    })

    it('should handle negative pan offsets', () => {
      const result = screenToWorld(400, 300, 100, -100, -50)
      expect(result.x).toBe(625) // (400 - (-100)) / 0.8
      expect(result.y).toBe(437.5) // (300 - (-50)) / 0.8
    })
  })

  describe('worldToScreen', () => {
    it('should convert world to screen coordinates correctly at 100% zoom', () => {
      const result = worldToScreen(1000, 750, 100, 0, 0)
      expect(result.x).toBe(800) // 1000 * 0.8
      expect(result.y).toBe(600) // 750 * 0.8
    })

    it('should convert world to screen coordinates correctly at 125% zoom (1:1 scale)', () => {
      const result = worldToScreen(800, 600, 125, 0, 0)
      expect(result.x).toBe(800) // 800 * 1.0
      expect(result.y).toBe(600) // 600 * 1.0
    })

    it('should handle pan offsets in transformations', () => {
      const result = worldToScreen(1000, 750, 100, 100, 50)
      expect(result.x).toBe(900) // 1000 * 0.8 + 100
      expect(result.y).toBe(650) // 750 * 0.8 + 50
    })

    it('should convert at different zoom levels', () => {
      const result50 = worldToScreen(1000, 750, 50, 0, 0)
      expect(result50.x).toBe(400) // 1000 * 0.4
      expect(result50.y).toBe(300) // 750 * 0.4

      const result200 = worldToScreen(1000, 750, 200, 0, 0)
      expect(result200.x).toBe(1600) // 1000 * 1.6
      expect(result200.y).toBe(1200) // 750 * 1.6
    })

    it('should handle negative pan offsets', () => {
      const result = worldToScreen(1000, 750, 100, -100, -50)
      expect(result.x).toBe(700) // 1000 * 0.8 + (-100)
      expect(result.y).toBe(550) // 750 * 0.8 + (-50)
    })
  })

  describe('round-trip conversions', () => {
    it('should maintain coordinates through round-trip conversion', () => {
      const worldX = 500
      const worldY = 400
      const zoom = 100
      const panX = 50
      const panY = 30

      const screen = worldToScreen(worldX, worldY, zoom, panX, panY)
      const world = screenToWorld(screen.x, screen.y, zoom, panX, panY)

      expect(world.x).toBeCloseTo(worldX)
      expect(world.y).toBeCloseTo(worldY)
    })

    it('should work at various zoom levels', () => {
      const testCases = [25, 50, 75, 100, 125, 150, 175, 200]

      testCases.forEach((zoom) => {
        const worldX = 1234
        const worldY = 567
        const panX = 100
        const panY = -50

        const screen = worldToScreen(worldX, worldY, zoom, panX, panY)
        const world = screenToWorld(screen.x, screen.y, zoom, panX, panY)

        expect(world.x).toBeCloseTo(worldX)
        expect(world.y).toBeCloseTo(worldY)
      })
    })
  })

  describe('worldDimensionsToScreen', () => {
    it('should transform dimensions at 100% zoom', () => {
      const result = worldDimensionsToScreen(100, 200, 100)
      expect(result.width).toBe(80) // 100 * 0.8
      expect(result.height).toBe(160) // 200 * 0.8
    })

    it('should transform dimensions at 125% zoom (1:1 scale)', () => {
      const result = worldDimensionsToScreen(100, 200, 125)
      expect(result.width).toBe(100) // 100 * 1.0
      expect(result.height).toBe(200) // 200 * 1.0
    })

    it('should transform dimensions at various zoom levels', () => {
      const result50 = worldDimensionsToScreen(100, 200, 50)
      expect(result50.width).toBe(40) // 100 * 0.4
      expect(result50.height).toBe(80) // 200 * 0.4

      const result200 = worldDimensionsToScreen(100, 200, 200)
      expect(result200.width).toBe(160) // 100 * 1.6
      expect(result200.height).toBe(320) // 200 * 1.6
    })
  })

  describe('screenDimensionsToWorld', () => {
    it('should transform dimensions at 100% zoom', () => {
      const result = screenDimensionsToWorld(80, 160, 100)
      expect(result.width).toBe(100) // 80 / 0.8
      expect(result.height).toBe(200) // 160 / 0.8
    })

    it('should transform dimensions at 125% zoom (1:1 scale)', () => {
      const result = screenDimensionsToWorld(100, 200, 125)
      expect(result.width).toBe(100) // 100 / 1.0
      expect(result.height).toBe(200) // 200 / 1.0
    })

    it('should round-trip dimension conversions', () => {
      const worldWidth = 250
      const worldHeight = 350
      const zoom = 75

      const screen = worldDimensionsToScreen(worldWidth, worldHeight, zoom)
      const world = screenDimensionsToWorld(screen.width, screen.height, zoom)

      expect(world.width).toBeCloseTo(worldWidth)
      expect(world.height).toBeCloseTo(worldHeight)
    })
  })

  describe('getWorldMousePosition', () => {
    it('should calculate world mouse position correctly', () => {
      const mockCanvas = {
        getBoundingClientRect: vi.fn(() => ({
          left: 100,
          top: 50,
          right: 1100,
          bottom: 650,
          width: 1000,
          height: 600,
        })),
      } as unknown as HTMLElement

      const mockEvent = {
        clientX: 500,
        clientY: 350,
      } as MouseEvent

      const result = getWorldMousePosition(mockEvent, mockCanvas, 100, 0, 0)

      // Screen position relative to canvas: (400, 300)
      // World position at 100% zoom (0.8 scale): (500, 375)
      expect(result.x).toBe(500) // (500 - 100) / 0.8
      expect(result.y).toBe(375) // (350 - 50) / 0.8
    })

    it('should account for pan offsets', () => {
      const mockCanvas = {
        getBoundingClientRect: vi.fn(() => ({
          left: 0,
          top: 0,
          right: 1000,
          bottom: 600,
          width: 1000,
          height: 600,
        })),
      } as unknown as HTMLElement

      const mockEvent = {
        clientX: 500,
        clientY: 300,
      } as MouseEvent

      const result = getWorldMousePosition(mockEvent, mockCanvas, 100, 50, 25)

      // Screen position relative to canvas: (500, 300)
      // With pan: (500 - 50, 300 - 25) = (450, 275)
      // World position: (562.5, 343.75)
      expect(result.x).toBe(562.5) // (500 - 50) / 0.8
      expect(result.y).toBe(343.75) // (300 - 25) / 0.8
    })
  })

  describe('isPointInWorldRect', () => {
    it('should correctly identify point inside rectangle', () => {
      expect(isPointInWorldRect(50, 50, 0, 0, 100, 100)).toBe(true)
      expect(isPointInWorldRect(0, 0, 0, 0, 100, 100)).toBe(true)
      expect(isPointInWorldRect(100, 100, 0, 0, 100, 100)).toBe(true)
    })

    it('should correctly identify point outside rectangle', () => {
      expect(isPointInWorldRect(-1, 50, 0, 0, 100, 100)).toBe(false)
      expect(isPointInWorldRect(50, -1, 0, 0, 100, 100)).toBe(false)
      expect(isPointInWorldRect(101, 50, 0, 0, 100, 100)).toBe(false)
      expect(isPointInWorldRect(50, 101, 0, 0, 100, 100)).toBe(false)
    })

    it('should handle rectangles with offset positions', () => {
      expect(isPointInWorldRect(150, 150, 100, 100, 100, 100)).toBe(true)
      expect(isPointInWorldRect(99, 99, 100, 100, 100, 100)).toBe(false)
      expect(isPointInWorldRect(201, 201, 100, 100, 100, 100)).toBe(false)
    })

    it('should handle edge cases', () => {
      // Point on edges should be considered inside
      expect(isPointInWorldRect(0, 50, 0, 0, 100, 100)).toBe(true)
      expect(isPointInWorldRect(100, 50, 0, 0, 100, 100)).toBe(true)
      expect(isPointInWorldRect(50, 0, 0, 0, 100, 100)).toBe(true)
      expect(isPointInWorldRect(50, 100, 0, 0, 100, 100)).toBe(true)
    })
  })
})