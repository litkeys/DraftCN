"use client"

import React, { useEffect, useState } from 'react'
import { blockRegistry } from '@/lib/blocks/registry'
import type { BlockTemplate } from '@/types/template'

export const BlockLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<BlockTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTemplates = () => {
      try {
        const allTemplates = blockRegistry.getAllTemplates()
        const allCategories = blockRegistry.getCategories()
        
        setTemplates(allTemplates)
        setCategories(allCategories)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-sm text-muted-foreground">Loading templates...</div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="p-4">
        <div className="text-sm text-muted-foreground">No templates available</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Block Library</h2>
      
      {categories.map((category) => {
        const categoryTemplates = blockRegistry.getTemplatesByCategory(category)
        
        if (categoryTemplates.length === 0) {
          return null
        }

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </h3>
            <div className="grid gap-3">
              {categoryTemplates.map((template) => (
                // TODO: Replace with TemplateCard component in Task 2
                <div key={template.typeId} className="text-sm">
                  {template.name}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}