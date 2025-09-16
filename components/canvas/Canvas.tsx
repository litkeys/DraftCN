'use client'

import React, { useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import { dragSelectors } from '@/store/slices/drag'
import { blocksSelectors } from '@/store/slices/blocks'
import { blockRegistry } from '@/lib/blocks/registry'
import { dragManager } from '@/lib/drag/manager'
import { DropPreview } from './DropPreview'
import { useKeyboard } from '@/hooks/useKeyboard'
import type { BlockTemplate } from '@/types/template'

/**
 * Canvas Component
 * Main canvas area where blocks can be dropped and arranged
 */
export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Setup keyboard event handling
  useKeyboard()

  // Get state and actions from store
  const isDragging = useAppStore(dragSelectors.isDragging)
  const draggedItem = useAppStore(dragSelectors.getDraggedItem)
  const sourceType = useAppStore(dragSelectors.getDragSource)
  const offset = useAppStore(dragSelectors.getDragOffset)
  const clearDragState = useAppStore((state) => state.clearDragState)
  const addBlock = useAppStore((state) => state.addBlock)
  const getHighestZIndex = useAppStore((state) => state.getHighestZIndex)
  const blocks = useAppStore(blocksSelectors.getAllBlocks)
  const selectBlock = useAppStore((state) => state.selectBlock)
  const clearSelection = useAppStore((state) => state.clearSelection)
  const updateBlock = useAppStore((state) => state.updateBlock)
  const setDragState = useAppStore((state) => state.setDragState)

  /**
   * Handle mouse down on block (for drag initiation)
   */
  const handleBlockMouseDown = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation() // Prevent canvas deselection

      // Check if already dragging
      if (dragManager.isDragging()) return

      // Get the block
      const block = blocks.find((b) => b.id === blockId)
      if (!block) return

      // Always select only this block (clears multi-selection)
      selectBlock(blockId)

      // Calculate offset from mouse to block origin
      const mouseOffset = {
        x: e.clientX - block.x,
        y: e.clientY - block.y,
      }

      // Start drag
      dragManager.startDrag('canvas', block, { x: e.clientX, y: e.clientY })

      // Store offset in drag state for accurate dragging
      setDragState({ offset: mouseOffset })
    },
    [blocks, selectBlock, setDragState]
  )

  /**
   * Handle click on block
   */
  const handleBlockClick = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation() // Prevent canvas click

      // Safety check: don't handle click if dragging
      if (dragManager.isDragging()) return

      selectBlock(blockId) // BlocksSlice handles deselection of others and sync
    },
    [selectBlock]
  )

  /**
   * Handle click on canvas
   */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        // Only if clicking canvas itself
        clearSelection() // BlocksSlice clears selectedBlockIds and syncs all blocks
      }
    },
    [clearSelection]
  )

  /**
   * Handle drop on canvas
   */
  const handleDrop = useCallback(
    (e: React.MouseEvent) => {
      // Only handle drop if actively dragging
      if (!isDragging || !draggedItem) {
        return
      }

      // Check if cursor is over the canvas element
      if (!canvasRef.current) {
        return
      }

      const rect = canvasRef.current.getBoundingClientRect()
      const isOverCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      if (!isOverCanvas) {
        // Not dropped on canvas, cancel drag
        dragManager.cancelDrag()
        clearDragState()
        return
      }

      // Handle drop based on source type
      if (sourceType === 'library') {
        // Create new block from template
        const template = draggedItem as BlockTemplate
        const newBlock = blockRegistry.generateBlockInstance(template.typeId)

        if (!newBlock) {
          console.error(
            `Failed to create block instance for template: ${template.typeId}`
          )
          dragManager.cancelDrag()
          clearDragState()
          return
        }

        // Calculate drop position relative to canvas, accounting for click offset
        const dropX = e.clientX - rect.left - (offset?.x || 0)
        const dropY = e.clientY - rect.top - (offset?.y || 0)

        // Update block position to drop coordinates
        newBlock.x = dropX
        newBlock.y = dropY

        // Calculate next z-index (sequential)
        const highestZ = getHighestZIndex()
        newBlock.z = highestZ + 1

        // Add new block to store
        addBlock(newBlock)
      } else if (sourceType === 'canvas') {
        // Moving existing block (will be implemented in future stories)
        console.log('Canvas drag not implemented in this story')
      }

      // End drag operation
      dragManager.endDrag()
      clearDragState()
    },
    [
      isDragging,
      draggedItem,
      sourceType,
      offset,
      clearDragState,
      addBlock,
      getHighestZIndex,
    ]
  )

  /**
   * Handle mouse up on canvas
   */
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleDrop(e)
      }
    },
    [isDragging, handleDrop]
  )

  /**
   * Handle mouse enter to track when cursor enters canvas
   */
  const handleMouseEnter = useCallback(() => {
    if (isDragging && canvasRef.current) {
      canvasRef.current.classList.add('drag-over')
    }
  }, [isDragging])

  /**
   * Handle mouse leave to track when cursor leaves canvas
   */
  const handleMouseLeave = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.classList.remove('drag-over')
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-slate-50 overflow-auto"
      onClick={handleCanvasClick}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="canvas"
      style={{
        minHeight: '100vh',
      }}
    >
      {/* Render dropped blocks */}
      {blocks.map((block) => {
        // Get the template for this block
        const template = blockRegistry.getTemplate(block.typeId)
        if (!template) {
          return null
        }

        const Component = template.component
        if (!Component) {
          return null
        }

        return (
          <div
            key={block.id}
            className={`absolute rounded cursor-pointer transition-colors border-2 ${
              block.selected
                ? 'border-blue-500'
                : 'border-transparent hover:border-blue-500'
            }`}
            style={{
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              zIndex: block.z,
              userSelect: 'none', // Prevent text selection during drag
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
            onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
            data-block-id={block.id}
            data-selected={block.selected}
            data-testid={`block-${block.id}`}
          >
            <Component {...block.props} />
          </div>
        )
      })}

      {/* Visual indicator when dragging over canvas */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-primary/20" />
        </div>
      )}

      {/* Render DropPreview when dragging */}
      <DropPreview />

      {/* Style for drag over state */}
      <style jsx>{`
        .drag-over {
          background-color: rgba(var(--primary), 0.05);
        }
      `}</style>
    </div>
  )
}

export default Canvas
