import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ZoomControl } from '@/components/layout/ZoomControl'
import { useAppStore } from '@/store'

vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}))

vi.mock('@/components/ui/slider', () => ({
  Slider: vi.fn(({ value, onValueChange, min, max, step, className, 'aria-label': ariaLabel }) => (
    <input
      type="range"
      value={value?.[0] || 0}
      onChange={(e) => {
        const newValue = parseInt(e.target.value)
        if (!isNaN(newValue) && onValueChange) {
          onValueChange([newValue])
        }
      }}
      min={min}
      max={max}
      step={step}
      className={className}
      aria-label={ariaLabel}
      data-testid="zoom-slider"
    />
  )),
}))

describe('ZoomControl', () => {
  const mockSetZoom = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        zoom: 100,
        setZoom: mockSetZoom,
      }
      return selector(state)
    })
  })

  it('should render slider with correct range and steps', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider')

    expect(slider).toHaveAttribute('min', '25')
    expect(slider).toHaveAttribute('max', '200')
    expect(slider).toHaveAttribute('step', '25')
  })

  it('should display current zoom percentage', () => {
    render(<ZoomControl />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should update zoom state on slider change', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider') as HTMLInputElement

    fireEvent.change(slider, { target: { value: '150' } })

    expect(mockSetZoom).toHaveBeenCalledWith(150)
  })

  it('should have default value of 100%', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider')

    expect(slider).toHaveAttribute('value', '100')
  })

  it('should snap to discrete steps when dragging', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider') as HTMLInputElement

    // Simulate dragging to 60 (should snap to 50 or 75)
    fireEvent.change(slider, { target: { value: '60' } })

    // Should snap to 50 (closer than 75)
    expect(mockSetZoom).toHaveBeenCalledWith(50)
  })

  it('should snap to nearest discrete step', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider') as HTMLInputElement

    // Test various values and their expected snapping
    const testCases = [
      { input: 30, expected: 25 },  // Closer to 25
      { input: 40, expected: 50 },  // Closer to 50
      { input: 62, expected: 50 },  // Closer to 50
      { input: 63, expected: 75 },  // Closer to 75
      { input: 110, expected: 100 }, // Closer to 100
      { input: 115, expected: 125 }, // Closer to 125
      { input: 190, expected: 200 }, // Closer to 200
    ]

    testCases.forEach(({ input, expected }) => {
      mockSetZoom.mockClear()
      fireEvent.change(slider, { target: { value: input.toString() } })
      expect(mockSetZoom).toHaveBeenCalledWith(expected)
    })
  })

  it('should display updated zoom value after change', () => {
    const { rerender } = render(<ZoomControl />)

    // Update the mock to return new zoom value
    ;(useAppStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        zoom: 150,
        setZoom: mockSetZoom,
      }
      return selector(state)
    })

    rerender(<ZoomControl />)
    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<ZoomControl />)
    const slider = screen.getByTestId('zoom-slider')

    expect(slider).toHaveAttribute('aria-label', 'Zoom level')
  })
})