"use client"

import React from 'react'
import { useAppStore } from '@/store'
import { dragSelectors } from '@/store/slices/drag'
import type { BlockTemplate } from '@/types/template'

/**
 * DropPreview Component
 * Renders a semi-transparent preview of the dragged item that follows the cursor
 */
export const DropPreview: React.FC = () => {
  // Get drag state from store
  const isActive = useAppStore(dragSelectors.isDragging)
  const draggedItem = useAppStore(dragSelectors.getDraggedItem)
  const position = useAppStore(dragSelectors.getDragPosition)
  const offset = useAppStore(dragSelectors.getDragOffset)
  const sourceType = useAppStore(dragSelectors.getDragSource)

  // Don't render if not dragging or if dragging from canvas
  if (!isActive || !draggedItem || sourceType === 'canvas') {
    return null
  }

  // Calculate the preview position
  // Subtract the initial click offset to maintain relative positioning
  const previewStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x - offset.x,
    top: position.y - offset.y,
    opacity: 0.7,
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'none', // Disable transitions for smooth movement
  }

  // Render different preview based on source type
  const renderPreview = () => {
    if (sourceType === 'library') {
      // For library items, render the template preview
      const template = draggedItem as BlockTemplate
      const Component = template.component
      
      return (
        <div
          style={{
            width: template.defaultWidth || 200,
            height: template.defaultHeight || 100,
            ...previewStyle,
          }}
          data-testid="drop-preview"
        >
          <div className="border-2 border-dashed border-primary/50 rounded-lg bg-background/90 shadow-2xl h-full w-full overflow-hidden">
            {Component ? (
              <Component {...(template.defaultProps || {})} />
            ) : (
              // Fallback for templates without component
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{template.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {template.category}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } else if (sourceType === 'canvas') {
      // For canvas items, render the existing block
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const block = draggedItem as any // Block type from canvas
      
      // Find the template for this block
      // This will be implemented when we have block registry integration
      return (
        <div
          style={{
            width: block.width || 200,
            height: block.height || 100,
            ...previewStyle,
          }}
          data-testid="drop-preview"
        >
          <div className="border-2 border-dashed border-primary/50 rounded-lg bg-background/90 shadow-2xl h-full w-full overflow-hidden">
            {block.component ? (
              <block.component {...(block.props || {})} />
            ) : (
              // Fallback preview for canvas blocks
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <div className="text-sm font-medium">Block</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {block.typeId || block.id}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return renderPreview()
}

// Export with memo for performance optimization
export default React.memo(DropPreview)