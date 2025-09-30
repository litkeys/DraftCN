"use client"

import React, { useState } from 'react'
import type { BlockTemplate } from '@/types/template'
import { FileImage } from 'lucide-react'
import { useDrag } from '@/hooks/useDrag'

interface TemplateCardProps {
  template: BlockTemplate
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [imageError, setImageError] = useState(false)
  
  // Use the custom drag hook for cleaner code
  const { handlePointerDown } = useDrag({
    sourceType: 'library',
    item: template
  })

  return (
    <div
      className="border rounded-lg p-3 cursor-grab hover:shadow-md hover:scale-[1.02] transition-all duration-200"
      data-template-id={template.typeId}
      onPointerDown={handlePointerDown}
      draggable={false}
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
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