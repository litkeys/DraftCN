"use client"

import React from 'react'
import type { BlockTemplate } from '@/types/template'

interface TemplateCardProps {
  template: BlockTemplate
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <div
      className="border rounded-lg p-3 cursor-grab hover:shadow-md hover:scale-[1.02] transition-all duration-200"
      data-template-id={template.typeId}
    >
      <div className="space-y-2">
        {template.thumbnail && (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-24 object-cover rounded"
          />
        )}
        <div className="text-sm font-medium">{template.name}</div>
      </div>
    </div>
  )
}