import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

// Mock the ZoomControl component
vi.mock('@/components/layout/ZoomControl', () => ({
  ZoomControl: vi.fn(() => (
    <div data-testid="zoom-control">ZoomControl</div>
  )),
}))

// Mock the ImportButton component
vi.mock('@/components/layout/ImportButton', () => ({
  ImportButton: vi.fn(() => (
    <div data-testid="import-button">ImportButton</div>
  )),
}))

// Mock the ExportButton component
vi.mock('@/components/layout/ExportButton', () => ({
  ExportButton: vi.fn(() => (
    <div data-testid="export-button">ExportButton</div>
  )),
}))

describe('Header', () => {
  it('should render the DraftCN logo', () => {
    render(<Header />)
    expect(screen.getByAltText('DraftCN Logo')).toBeInTheDocument()
  })

  it('should render the ZoomControl component', () => {
    render(<Header />)
    expect(screen.getByTestId('zoom-control')).toBeInTheDocument()
  })

  it('should render the ImportButton component', () => {
    render(<Header />)
    expect(screen.getByTestId('import-button')).toBeInTheDocument()
  })

  it('should render the ExportButton component', () => {
    render(<Header />)
    expect(screen.getByTestId('export-button')).toBeInTheDocument()
  })

  it('should position logo on the left', () => {
    render(<Header />)
    const logo = screen.getByAltText('DraftCN Logo')
    const logoContainer = logo.parentElement
    expect(logoContainer).toHaveClass('flex', 'items-center', 'flex-1')
  })

  it('should position ZoomControl in the center', () => {
    render(<Header />)
    const zoomControl = screen.getByTestId('zoom-control')
    const zoomContainer = zoomControl.parentElement
    expect(zoomContainer).toHaveClass('absolute', 'left-1/2', 'transform', '-translate-x-1/2')
  })

  it('should position ImportButton and ExportButton on the right', () => {
    render(<Header />)
    const importButton = screen.getByTestId('import-button')
    const exportButton = screen.getByTestId('export-button')
    const buttonsContainer = importButton.parentElement

    // Both buttons should be in the same container
    expect(buttonsContainer).toBe(exportButton.parentElement)

    // Container should have proper classes including gap-2 for spacing
    expect(buttonsContainer).toHaveClass('flex', 'items-center', 'justify-end', 'flex-1', 'gap-2')
  })

  it('should position ImportButton before ExportButton', () => {
    render(<Header />)
    const importButton = screen.getByTestId('import-button')
    const exportButton = screen.getByTestId('export-button')
    const buttonsContainer = importButton.parentElement

    // ImportButton should come before ExportButton
    const children = Array.from(buttonsContainer?.children || [])
    const importIndex = children.indexOf(importButton)
    const exportIndex = children.indexOf(exportButton)

    expect(importIndex).toBeLessThan(exportIndex)
  })

  it('should apply correct header styling', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toHaveClass(
      'h-16',
      'bg-background',
      'border-b',
      'border-border',
      'flex',
      'items-center',
      'px-6',
      'relative'
    )
  })

  it('should have proper layout structure', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    // Should have 3 direct children
    expect(header?.children).toHaveLength(3)

    // First child: logo container (flex-1)
    expect(header?.children[0]).toHaveClass('flex', 'items-center', 'flex-1')

    // Second child: zoom control container (centered)
    expect(header?.children[1]).toHaveClass('absolute', 'left-1/2')

    // Third child: import/export buttons container (flex-1 with justify-end and gap)
    expect(header?.children[2]).toHaveClass('flex', 'items-center', 'justify-end', 'flex-1', 'gap-2')
  })
})