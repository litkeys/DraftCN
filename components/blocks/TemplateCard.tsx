"use client"

import React, { useState, useCallback } from 'react'
import type { BlockTemplate } from '@/types/template'
import { FileImage } from 'lucide-react'
import { dragManager } from '@/lib/drag/manager'
import { useAppStore } from '@/store'

interface TemplateCardProps {
  template: BlockTemplate
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [imageError, setImageError] = useState(false)
  const setDragState = useAppStore((state) => state.setDragState)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault()
    
    // Calculate initial offset from click position
    const rect = e.currentTarget.getBoundingClientRect()
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    // Start drag operation
    dragManager.startDrag('library', template, offset)
    
    // Update store with drag state
    setDragState({
      isActive: true,
      sourceType: 'library',
      draggedItem: template,
      offset,
      position: { x: e.clientX, y: e.clientY }
    })
    
    // Set up global mouse event handlers
    const handleMouseMove = (moveEvent: MouseEvent) => {
      setDragState({
        position: { x: moveEvent.clientX, y: moveEvent.clientY }
      })
    }
    
    const handleMouseUp = () => {
      // Clean up global event handlers
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // End drag will be handled by Canvas drop handler
      // For now, just clean up if not dropped on valid target
      if (dragManager.isDragging()) {
        dragManager.endDrag()
        setDragState({
          isActive: false,
          sourceType: null,
          draggedItem: null,
          position: { x: 0, y: 0 },
          offset: { x: 0, y: 0 }
        })
      }
    }
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [template, setDragState])

  return (
    <div
      className="border rounded-lg p-3 cursor-grab hover:shadow-md hover:scale-[1.02] transition-all duration-200"
      data-template-id={template.typeId}
      onMouseDown={handleMouseDown}
      draggable={false}
    >
      <div className="space-y-2">
        {template.thumbnail && !imageError ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-24 object-cover rounded"
            onError={() => setImageError(true)}
            draggable={false}
          />
        ) : (
          <div className="w-full h-24 bg-muted rounded flex items-center justify-center">
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="text-sm font-medium">{template.name}</div>
      </div>
    </div>
  )
}