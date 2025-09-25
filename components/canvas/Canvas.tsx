'use client'

import React, { useRef, useCallback, useMemo } from 'react'
import { useAppStore } from '@/store'
import { dragSelectors } from '@/store/slices/drag'
import { blocksSelectors } from '@/store/slices/blocks'
import { blockRegistry } from '@/lib/blocks/registry'
import { dragManager } from '@/lib/drag/manager'
import { DropPreview } from './DropPreview'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  calculateActualScale,
  screenToWorld,
  worldToScreen,
  worldDimensionsToScreen,
} from '@/lib/canvas/transforms'
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
  const blurSearchInput = useAppStore((state) => state.blurSearchInput)

  // Get zoom and pan state
  const zoom = useAppStore((state) => state.zoom)
  const panX = useAppStore((state) => state.panX)
  const panY = useAppStore((state) => state.panY)

  /**
   * Calculate the required canvas dimensions based on block positions and zoom
   */
  const calculateCanvasDimensions = useMemo(() => {
    const baseWidth = 1200
    const baseMinHeight = 1200

    // Calculate actual scale for zoom
    const actualScale = calculateActualScale(zoom)

    // Calculate height based on blocks
    let worldHeight = baseMinHeight
    if (blocks.length > 0) {
      // Find the lowest point of all blocks in world coordinates
      const lowestPoint = Math.max(
        ...blocks.map((block) => block.y + block.height)
      )
      worldHeight = Math.max(baseMinHeight, lowestPoint + 1200)
    }

    // Transform dimensions to screen coordinates
    return {
      width: baseWidth * actualScale,
      height: worldHeight * actualScale,
      worldWidth: baseWidth,
      worldHeight: worldHeight,
    }
  }, [blocks, zoom])

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
      blurSearchInput?.() // Blur search input when block is selected

      // Get canvas bounds for coordinate system conversion
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()

      // Convert mouse position to canvas-relative screen coordinates
      const canvasMouseX = e.clientX - rect.left
      const canvasMouseY = e.clientY - rect.top

      // Convert mouse to world coordinates
      const worldMouse = screenToWorld(canvasMouseX, canvasMouseY, zoom, panX, panY)

      // Calculate offset from mouse to block origin (in world coordinates)
      const mouseOffset = {
        x: worldMouse.x - block.x,
        y: worldMouse.y - block.y,
      }

      // Start drag
      dragManager.startDrag('canvas', block, { x: e.clientX, y: e.clientY })

      // Store offset and complete drag state in Zustand store for accurate dragging
      setDragState({
        offset: mouseOffset,
        isActive: true,
        sourceType: 'canvas',
        draggedItem: block,
      })
    },
    [blocks, selectBlock, setDragState, blurSearchInput, zoom, panX, panY]
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
      blurSearchInput?.() // Blur search input when block is selected
    },
    [selectBlock, blurSearchInput]
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
   * Handle clicks on container area (for deselection)
   */
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Check if clicked on container (not canvas or its children)
      if (e.target === e.currentTarget) {
        clearSelection() // Deselect all blocks
      }
    },
    [clearSelection]
  )

  /**
   * Handle drop from library
   */
  const handleLibraryDrop = useCallback(
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

      // Calculate drop position in world coordinates
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      const worldPos = screenToWorld(screenX, screenY, zoom, panX, panY)

      // Apply offset in world coordinates
      let dropX = worldPos.x - (offset?.x || 0)
      let dropY = worldPos.y - (offset?.y || 0)

      // Constrain position to canvas boundaries in world coordinates
      const worldCanvasWidth = 1200 // World coordinate width
      dropX = Math.max(0, Math.min(dropX, worldCanvasWidth - newBlock.width))
      dropY = Math.max(0, dropY) // Allow vertical extension but not negative

      // Update block position to drop coordinates
      newBlock.x = dropX
      newBlock.y = dropY

      // Calculate next z-index (sequential)
      const highestZ = getHighestZIndex()
      newBlock.z = highestZ + 1

      // Add new block to store
      addBlock(newBlock)

      // Select the newly dropped block
      selectBlock(newBlock.id)

      // End drag operation
      dragManager.endDrag()
      clearDragState()
    },
    [
      isDragging,
      draggedItem,
      offset,
      clearDragState,
      addBlock,
      getHighestZIndex,
      selectBlock,
      zoom,
      panX,
      panY,
    ]
  )

  /**
   * Handle mouse up on canvas - routes between drop types
   */
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Check if we're dragging
      if (!dragManager.isDragging()) return

      const { sourceType: dragSourceType } = dragManager.getDragState()

      if (dragSourceType === 'canvas') {
        // Canvas block drag completion - apply position correction
        if (draggedItem && draggedItem.id && canvasRef.current) {
          // Get the current block to check its final position
          const block = blocks.find((b) => b.id === draggedItem.id)
          if (block) {
            // Apply position constraints to ensure block stays within canvas (world coordinates)
            const worldCanvasWidth = 1200
            const correctedX = Math.max(
              0,
              Math.min(block.x, worldCanvasWidth - block.width)
            )
            const correctedY = Math.max(0, block.y) // Allow vertical extension but not negative

            // Update to corrected position if needed
            if (correctedX !== block.x || correctedY !== block.y) {
              updateBlock(block.id, { x: correctedX, y: correctedY })
            }
          }
        }

        // Block remains selected after drag
        dragManager.endDrag()
        clearDragState()
      } else if (dragSourceType === 'library') {
        // Library drop - handle drop to create new block
        handleLibraryDrop(e)
      }
    },
    [clearDragState, handleLibraryDrop, draggedItem, blocks, updateBlock]
  )

  /**
   * Handle mouse move for drag tracking
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Check if dragging and source is canvas
      if (dragManager.isDragging() && sourceType === 'canvas') {
        // Get canvas bounds for relative positioning
        if (!canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()

        // Calculate new block position in world coordinates
        const screenX = e.clientX - rect.left
        const screenY = e.clientY - rect.top
        const worldPos = screenToWorld(screenX, screenY, zoom, panX, panY)

        // Apply offset in world coordinates
        const newX = worldPos.x - (offset?.x || 0)
        const newY = worldPos.y - (offset?.y || 0)

        // Update the dragged block's position in real-time without constraints
        // This allows for smooth dragging without jarring corrections
        if (draggedItem?.id) {
          updateBlock(draggedItem.id, { x: newX, y: newY })
        }
      }
    },
    [sourceType, offset, draggedItem, updateBlock, zoom, panX, panY]
  )

  /**
   * Handle mouse enter to track when cursor enters canvas
   */
  const handleMouseEnter = useCallback(() => {
    // Removed drag-over class to prevent background color change
  }, [])

  /**
   * Handle mouse leave to track when cursor leaves canvas
   */
  const handleMouseLeave = useCallback(() => {
    // Clear drag state if dragging when mouse leaves canvas
    if (dragManager.isDragging()) {
      const { sourceType } = dragManager.getDragState()

      // Only handle canvas drags (not library drags)
      if (sourceType === 'canvas') {
        // Apply position correction before ending drag
        if (draggedItem && draggedItem.id) {
          const block = blocks.find((b) => b.id === draggedItem.id)
          if (block) {
            // Apply position constraints to ensure block stays within canvas (world coordinates)
            const worldCanvasWidth = 1200
            const correctedX = Math.max(
              0,
              Math.min(block.x, worldCanvasWidth - block.width)
            )
            const correctedY = Math.max(0, block.y) // Allow vertical extension but not negative

            // Update to corrected position if needed
            if (correctedX !== block.x || correctedY !== block.y) {
              updateBlock(block.id, { x: correctedX, y: correctedY })
            }
          }
        }

        dragManager.endDrag()
        clearDragState()
      }
    }
  }, [clearDragState, draggedItem, blocks, updateBlock])

  return (
    <div
      className="w-full h-full bg-gray-100 overflow-y-auto overflow-x-hidden p-8"
      onClick={handleContainerClick}
      data-testid="canvas-container"
    >
      <div
        ref={canvasRef}
        className="relative bg-white shadow-md outline outline-1 outline-gray-200 mx-auto"
        onClick={handleCanvasClick}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-testid="canvas"
        style={{
          width: `${calculateCanvasDimensions.width}px`,
          minHeight: `${calculateCanvasDimensions.height}px`,
          transformOrigin: 'top left',
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

          // Transform world coordinates to screen coordinates for rendering
          const screenPos = worldToScreen(block.x, block.y, zoom, panX, panY)
          const screenDimensions = worldDimensionsToScreen(block.width, block.height, zoom)
          const actualScale = calculateActualScale(zoom)

          return (
            <div
              key={block.id}
              className={`absolute rounded cursor-pointer ${
                block.selected
                  ? 'outline outline-2 outline-blue-500'
                  : !isDragging
                  ? 'hover:outline hover:outline-2 hover:outline-blue-500'
                  : ''
              }`}
              style={{
                left: screenPos.x,
                top: screenPos.y,
                width: screenDimensions.width,
                height: screenDimensions.height,
                zIndex: block.z,
                userSelect: 'none', // Prevent text selection during drag
                overflow: 'hidden', // Prevent content from overflowing scaled container
              }}
              onClick={(e) => handleBlockClick(block.id, e)}
              onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
              data-block-id={block.id}
              data-selected={block.selected}
              data-testid={`block-${block.id}`}
            >
              <div
                style={{
                  transform: `scale(${actualScale})`,
                  transformOrigin: 'top left',
                  width: `${block.width}px`,
                  height: `${block.height}px`,
                }}
              >
                <Component {...block.props} />
              </div>
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
      </div>
    </div>
  )
}

export default Canvas
