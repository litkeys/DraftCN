import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BlockLibraryErrorBoundary } from '@/components/blocks/BlockLibraryErrorBoundary'
import React from 'react'

const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child component rendered successfully</div>
}

describe('BlockLibraryErrorBoundary', () => {
  // Suppress console.error for these tests since we expect errors
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={false} />
        </BlockLibraryErrorBoundary>
      )

      expect(screen.getByText('Child component rendered successfully')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch errors and display error UI', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      expect(screen.getByText('Error loading block library')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.queryByText('Child component rendered successfully')).not.toBeInTheDocument()
    })

    it('should display generic message for errors without message', () => {
      const ThrowEmptyError: React.FC = () => {
        throw {}
      }

      render(
        <BlockLibraryErrorBoundary>
          <ThrowEmptyError />
        </BlockLibraryErrorBoundary>
      )

      expect(screen.getByText('Error loading block library')).toBeInTheDocument()
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })

    it('should provide a retry button', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      const retryButton = screen.getByText('Try again')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton.tagName.toLowerCase()).toBe('button')
    })

    it('should reset error state when retry button is clicked', () => {
      let shouldThrow = true
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>Child component rendered successfully</div>
      }

      const { rerender } = render(
        <BlockLibraryErrorBoundary>
          <TestComponent />
        </BlockLibraryErrorBoundary>
      )

      expect(screen.getByText('Error loading block library')).toBeInTheDocument()

      // Click retry button to reset error state
      const retryButton = screen.getByText('Try again')
      shouldThrow = false // Now component won't throw
      fireEvent.click(retryButton)

      // Force rerender after clicking retry
      rerender(
        <BlockLibraryErrorBoundary>
          <TestComponent />
        </BlockLibraryErrorBoundary>
      )

      expect(screen.getByText('Child component rendered successfully')).toBeInTheDocument()
      expect(screen.queryByText('Error loading block library')).not.toBeInTheDocument()
    })

    it('should log errors to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'BlockLibrary Error:',
        expect.any(Error),
        expect.any(Object)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error UI Styling', () => {
    it('should apply proper styling to error message', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      const errorTitle = screen.getByText('Error loading block library')
      expect(errorTitle.className).toContain('text-sm')
      expect(errorTitle.className).toContain('font-medium')
      expect(errorTitle.className).toContain('text-destructive')
    })

    it('should apply proper styling to error details', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      const errorMessage = screen.getByText('Test error message')
      expect(errorMessage.className).toContain('text-xs')
      expect(errorMessage.className).toContain('text-muted-foreground')
    })

    it('should apply proper styling to retry button', () => {
      render(
        <BlockLibraryErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BlockLibraryErrorBoundary>
      )

      const retryButton = screen.getByText('Try again')
      expect(retryButton.className).toContain('text-xs')
      expect(retryButton.className).toContain('text-primary')
      expect(retryButton.className).toContain('hover:underline')
    })
  })
})